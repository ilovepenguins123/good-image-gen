import { ProfileNetworthCalculator } from 'skyhelper-networth';

async function fetchSkyblockStats(apikey: string, uuid: string) {
    try {
      const formattedUuid = uuid.replace(
        /^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/,
        "$1-$2-$3-$4-$5"
      );
      
      const hypixelResponse = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${formattedUuid}&key=${apikey}`);
      const hypixelData = await hypixelResponse.json();
      
      if (!hypixelData.success) {
        console.error("Hypixel API error:", hypixelData.cause);
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      
      if (!hypixelData.profiles || hypixelData.profiles.length === 0) {
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      
      const activeProfile = hypixelData.profiles.find((profile: any) => profile.selected) || hypixelData.profiles[0];
      if (!activeProfile || !activeProfile.members) {
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      const museumResponse = await fetch(`https://api.hypixel.net/v2/skyblock/museum?profile=${activeProfile.profile_id}&key=${apikey}`);
      const museumData = await museumResponse.json();
      
      if (!museumData.success) {
        console.error("Hypixel API error:", museumData.cause);
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      
      const bankBalance = activeProfile.banking?.balance || 0;
      const profileData = activeProfile.members[uuid.replace(/-/g, '')];
      
      if (!profileData) {
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      
      const networthData = new ProfileNetworthCalculator(profileData, museumResponse, bankBalance);

      const networth = await networthData.getNetworth().then((result) => result.unsoulboundNetworth);

      const COSMETIC_SKILLS = ["runecrafting", "social"];
      const SKILL_NAMES = [
        'farming', 'mining', 'combat', 'foraging', 'fishing', 
        'enchanting', 'alchemy', 'taming', 'carpentry', 'runecrafting', 'social'
      ];

      const SKILL_XP_TABLE = [
        0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925,
        22425, 32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425,
        822425, 1222425, 1722425, 2322425, 3022425, 3822425, 4722425, 5722425,
        6822425, 8022425, 9322425, 10722425, 12222425, 13822425, 15522425,
        17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425,
        32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425,
        55172425, 59472425, 64072425, 68972425, 74172425, 79672425, 85472425,
        91572425, 97972425, 104672425, 111672425
      ];

      const SKILL_CAPS: Record<string, number> = {
        farming: 60, mining: 60, combat: 60, foraging: 50, fishing: 50, 
        enchanting: 60, alchemy: 50, taming: 60, carpentry: 50, 
        runecrafting: 25, social: 25
      };

      function getSkillLevel(experience: number, maxLevel: number = 50) {
        if (!experience || experience < 0) return { level: 0, experience: 0, progress: 0 };
        
        const xpTable = SKILL_XP_TABLE.slice(0, maxLevel + 1);
        
        for (let i = xpTable.length - 1; i >= 0; i--) {
          if (experience >= xpTable[i]) {
            const progress = i === maxLevel ? 0 : 
              (experience - xpTable[i]) / (xpTable[i + 1] - xpTable[i]);
            
            return {
              level: i,
              experience: experience,
              progress: Math.min(progress, 1)
            };
          }
        }
        
        return { level: 0, experience: experience, progress: 0 };
      }

      const skillsXP = profileData.player_data?.experience || profileData.experience || {};
      const skillLevels: Record<string, number> = {};
      const skillLevelsWithProgress: Record<string, number> = {};
      const skillsData: Record<string, any> = {};

      for (const skill of SKILL_NAMES) {
        const xp = skillsXP[`SKILL_${skill.toUpperCase()}`] || skillsXP[skill] || 0;
        const maxLevel = SKILL_CAPS[skill] || 50;
        const skillLevel = getSkillLevel(xp, maxLevel);
        skillsData[skill] = {
          ...skillLevel,
          maxLevel: maxLevel
        };

        skillLevels[skill] = skillLevel.level;
        skillLevelsWithProgress[skill] = skillLevel.level + skillLevel.progress;
      }

      const mainSkills = SKILL_NAMES.filter(s => !COSMETIC_SKILLS.includes(s));
      const averageSkillLevel = mainSkills.reduce((sum, s) => sum + skillLevels[s], 0) / mainSkills.length;
      const averageSkillLevelWithProgress = mainSkills.reduce((sum, s) => sum + skillLevelsWithProgress[s], 0) / mainSkills.length;

      let catacombsLevel = 0;
      if (profileData.dungeons?.dungeon_types?.catacombs?.experience) {
        const catacombsXp = profileData.dungeons.dungeon_types.catacombs.experience;
        catacombsLevel = Math.min(50, Math.floor(Math.pow(catacombsXp / 10000, 0.5) + 1));
      }
      let skyblockLevel = 0;
      if (profileData.leveling?.experience) {
        const sbXp = profileData.leveling.experience;
        skyblockLevel = Math.floor(sbXp / 100);
      }
      return JSON.parse(JSON.stringify({
        networth: networth,
        bankBalance: bankBalance,
        profileData: profileData,
        skillAverage: parseFloat(averageSkillLevel.toFixed(2)),
        skillAverageWithProgress: parseFloat(averageSkillLevelWithProgress.toFixed(2)),
        catacombsLevel,
        skyblockLevel
      }));
    } catch (error) {
      console.error('Error fetching Skyblock stats:', error);
      return {
        networth: 0,
        bankBalance: 0,
        profileData: null
      };
    }
}

export default fetchSkyblockStats;