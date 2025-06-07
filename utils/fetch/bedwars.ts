export function fetchBedwarsStats(key: string, uuid: string) {
  return fetch(`https://api.hypixel.net/player?key=${key}&uuid=${uuid}`)
    .then(response => response.json())
    .then(data => {
      let player = data.player;
      let stats = {
        uuid: uuid,
        firstLogin: player?.firstLogin ? new Date(player.firstLogin).toLocaleString('en-US', { timeZone: 'EST' }) : "None",
        lastLogin: player?.lastLogin ? new Date(player.lastLogin).toLocaleString('en-US', { timeZone: 'EST' }) : "None",
        leveling: {
          level: 0,
          experience: 0,
          experienceneeded: 2500
        },
        ranksgifted: 0,
        bedwars: {
          level: 0,
          coins: 0,
          finalKills: 0,
          finalDeaths: 0,
          winstreak: 0,
          fkdr: 0,
          wins: 0,
          losses: 0,
          wlr: 0,
        },
        skywars: {
          level: 0,
          coins: 0,
          kills: 0,
          deaths: 0,
        },
        duels: {
          kills: 0,
          deaths: 0,
          wins: 0,
          losses: 0,
          wlr: 0
        },
        rank: { rank: "NONE", color: "gray", plusColor: "yellow" },
        level: 0
      };

      if (uuid === "8667ba71b85a4004af54457a9734eed7") {
        return stats;
      }

      if (!data.success) {
        console.error("Hypixel API error:", data.cause);
        return stats;
      }

      if (!player) {
        console.error("Failed to retrieve player data.");
        return stats;
      }
      let bedwarsStats = player.stats.Bedwars;
      let skywarsStats = player.stats.SkyWars;
      let duelsStats = player.stats.Duels;
      function getTotalExpForLevel(level: number) {
        return ((50 * (level + 2.5)) ** 2 - 30625) / 2;
      }

      function getExpForNextLevel(level: number) {
        return getTotalExpForLevel(level + 1) - getTotalExpForLevel(level);
      }
      stats.leveling.level = player.networkExp
        ? Math.floor(Math.sqrt(player.networkExp * 2 + 30625) / 50 - 2.5)
        : 1;

      stats.leveling.experienceneeded = getExpForNextLevel(stats.leveling.level);
      stats.leveling.experience = player.networkExp - getTotalExpForLevel(stats.leveling.level);
      stats.ranksgifted = player.giftingMeta?.ranksGiven || 0;

      if (bedwarsStats) {
        stats.bedwars.level = Math.floor(bedwarsStats.Experience / 5000);
        stats.bedwars.coins = bedwarsStats.coins;
        stats.bedwars.winstreak = bedwarsStats.winstreak;
        stats.bedwars.finalKills = bedwarsStats.final_kills_bedwars;
        stats.bedwars.finalDeaths = bedwarsStats.final_deaths_bedwars;
        stats.bedwars.fkdr = Number(bedwarsStats.final_kills_bedwars) / Number(bedwarsStats.final_deaths_bedwars);
        stats.bedwars.wins = bedwarsStats.wins_bedwars;
        stats.bedwars.losses = bedwarsStats.losses_bedwars;
        stats.bedwars.wlr = Number(bedwarsStats.wins_bedwars) / Number(bedwarsStats.losses_bedwars);
      }
      if (skywarsStats) {
        stats.skywars.level = skywarsStats.levelFormatted.replace(/[§][0-9a-fk-or]/g, "");
        stats.skywars.coins = skywarsStats.coins;
        stats.skywars.kills = skywarsStats.kills;
        stats.skywars.deaths = skywarsStats.deaths;
      }
      if (duelsStats) {
        stats.duels.kills = duelsStats.kills;
        stats.duels.deaths = duelsStats.deaths;
        stats.duels.wins = duelsStats.wins;
        stats.duels.losses = duelsStats.losses;
        stats.duels.wlr = Number((Number(duelsStats.wins) / Number(duelsStats.losses)).toFixed(2));
      }
      if (player?.rank) {
        stats.rank = {
          ...stats.rank,
          rank: player.rank.replace("_PLUS", "+")
        };
      } else if (player?.newPackageRank) {
        stats.rank = {
          ...stats.rank,
          rank: player.newPackageRank.replace("_PLUS", "+")
        };
      }
      stats.rank.plusColor = player.rankPlusColor || "yellow";
      switch (stats.rank.rank) {
        case "YOUTUBER":
          stats.rank.rank = "YOUTUBE"
          stats.rank.color = "#FF6B6B";
          break;
        case "MVP++":
          stats.rank.color = "yellow";
          break;
        case "MVP+":
          stats.rank.color = "aqua";
          break;
        case "MVP":
          stats.rank.color = "aqua";
          break;
        case "VIP+":
          stats.rank.color = "lime";
          break;
        case "VIP":
          stats.rank.color = "lime";
          break;
        default:
          stats.rank.color = "gray";
      }
      stats.rank.rank.replace(" ]", "]");
      return stats;
    })
    .catch(error => {
      console.error(`Error fetching Bedwars stats for ${uuid}:`, error);
      return {
        uuid: uuid,
        leveling: {
          level: 0,
          experienceneeded: 0,
          experience: 0,
        },
        ranksgifted: 0,
        bedwars: {
          level: 0,
          coins: 0,
          finalKills: 0,
          finalDeaths: 0,
          winstreak: 0,
          fkdr: 0,
          wins: 0,
          losses: 0,
          wlr: 0,
        },
        skywars: {
          level: 0,
          coins: 0,
          kills: 0,
          deaths: 0,
        },
        duels: {
          kills: 0,
          deaths: 0,
          wins: 0,
          losses: 0,
          wlr: 0
        },
        rank: {
          rank: "NONE",
          color: "white",
          plusColor: "yellow",
        }
      };
    });
}

export default fetchBedwarsStats;