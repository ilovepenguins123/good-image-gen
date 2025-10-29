import { ProfileNetworthCalculator } from 'skyhelper-networth';
import { getSkyblockProfiles, getSkyblockMuseum } from '../hypixelWrapper.ts';
import fs from 'fs';
function savePlayer(uuid: string, data: any) {
  fs.writeFileSync(`./${uuid}.json`, JSON.stringify(data, null, 2));
}
async function fetchSkyblockStats(apikey: string, uuid: string) {

    try {
      console.log('[DEV] Skyblock: Starting fetch');
      const formattedUuid = uuid.replace(
        /^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/,
        "$1-$2-$3-$4-$5"
      );

      console.log('[DEV] Skyblock: Fetching profiles');
      const hypixelData = await getSkyblockProfiles(apikey, formattedUuid);
      console.log('[DEV] Skyblock: Profiles fetched');
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
      if (!activeProfile) {
        return {
          networth: 0,
          bankBalance: 0,
          profileData: null
        };
      }
      console.log('[DEV] Skyblock: Fetching museum data');
      const museumData = await getSkyblockMuseum(apikey, activeProfile.profile_id);
      console.log('[DEV] Skyblock: Museum data fetched');

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
      
      console.log('[DEV] Skyblock: Calculating networth');
      const networthData = new ProfileNetworthCalculator(profileData, museumData, bankBalance);

      // Add timeout to networth calculation to prevent hanging
      const networthPromise = networthData.getNetworth().then((result) => result.unsoulboundNetworth);
      const timeoutPromise = new Promise<number>((_, reject) => {
        setTimeout(() => reject(new Error('Networth calculation timed out after 60 seconds')), 60000);
      });

      const networth = await Promise.race([networthPromise, timeoutPromise]);
      console.log('[DEV] Skyblock: Networth calculated', { networth });

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
        
        // Catacombs XP requirements per level
        const CATACOMBS_XP = [
          0, 50, 125, 235, 395, 625, 955, 1425, 2095, 3045, 4385, 6275, 8940, 12700, 17960,
          25340, 35640, 49940, 69940, 97640, 135640, 188140, 259640, 356640, 488640, 668640,
          911640, 1239640, 1684640, 2284640, 3084640, 4149640, 5559640, 7459640, 9959640,
          13259640, 17559640, 23159640, 30359640, 39559640, 51559640, 66559640, 85559640,
          109559640, 139559640, 177559640, 225559640, 285559640, 360559640, 453559640, 569809640
        ];
        
        // Find the level based on XP
        for (let i = CATACOMBS_XP.length - 1; i >= 0; i--) {
          if (catacombsXp >= CATACOMBS_XP[i]) {
            catacombsLevel = i;
            break;
          }
        }
      }
      let skyblockLevel = 0;
      if (profileData.leveling?.experience) {
        const sbXp = profileData.leveling.experience;
        skyblockLevel = Math.floor(sbXp / 100);
      }
      const activeMembers = Object.entries(activeProfile.members).filter(([memberId, memberData]: [string, any]) => {
        return !(memberData.profile?.coop_invitation?.confirmed === false || memberData.profile?.deletion_notice?.timestamp !== undefined)
      });
      console.log(`${activeMembers.length} active members`);
      const totalActiveMembers = activeMembers.length;
      const coopMembersCount = totalActiveMembers - 1; // Subtract 1 for the main player

      console.log('[DEV] Skyblock: Preparing return data');
      return JSON.parse(JSON.stringify({
        networth: networth,
        bankBalance: bankBalance,
        profileData: profileData,
        skillAverage: parseFloat(averageSkillLevel.toFixed(2)),
        skillAverageWithProgress: parseFloat(averageSkillLevelWithProgress.toFixed(2)),
        catacombsLevel,
        skyblockLevel,
        coopMembersCount: coopMembersCount
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