import { getGuildByPlayer } from '../hypixelWrapper.ts';

function fetchGuildStats(key: string, uuid: string) {
  return getGuildByPlayer(key, uuid)
    .then(data => {
      let stats = {
        guild: {
          name: "NONE",
          tag: "NONE",
          rank: "NONE",
          members: 0,
          level: 0,
          xp: 0,
          xpNeeded: 0
        }
      };

      if (!data.success) {
        console.error("Hypixel API error:", data.cause);
        return stats;
      }

      if (data.guild) {
        stats.guild.name = data.guild.name;
        stats.guild.tag = data.guild.tag || "";
        stats.guild.members = data.guild.members.length;
        stats.guild.rank = data.guild.members.find((member: any) => member.uuid === uuid)?.rank || "NONE"
        stats.guild.xp = data.guild.exp;
        const BASE_LEVELS = [
          100000, 150000, 250000, 500000, 750000,
          1000000, 1250000, 1500000, 2000000, 2500000,
          2500000, 2500000, 2500000, 2500000, 3000000
        ];

        let level = 0;
        let remainingXp = data.guild.exp;
        for (let i = 0; i < BASE_LEVELS.length; i++) {
          if (remainingXp >= BASE_LEVELS[i]) {
            remainingXp -= BASE_LEVELS[i];
            level++;
          } else {
            stats.guild.xpNeeded = BASE_LEVELS[i] - remainingXp;
            break;
          }
        }

        if (level >= BASE_LEVELS.length) {
          const ASCENDED_LEVEL_XP = BASE_LEVELS[BASE_LEVELS.length - 1];
          const ascendedLevels = Math.floor(remainingXp / ASCENDED_LEVEL_XP);
          level += ascendedLevels;
          remainingXp = remainingXp % ASCENDED_LEVEL_XP;
          stats.guild.xpNeeded = ASCENDED_LEVEL_XP - remainingXp;
        }

        stats.guild.level = level;
      }

      return stats;
    })
    .catch(error => {
      console.error('Error fetching guild stats:', error);
      return {
        guild: {
          name: "NONE",
          tag: "NONE",
          rank: "NONE",
          members: 0,
          level: 0,
          xp: 0,
          xpNeeded: 0
        }
      };
    });
}

export default fetchGuildStats;