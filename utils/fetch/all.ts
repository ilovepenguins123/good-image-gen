import MCQuery from './MCQuery.ts';
import fetchBedwarsStats from './bedwars.ts';
import fetchSkyblockStats from './skyblock.ts';
import fetchGuildStats from './guild.ts';
import { fetchCapes } from './capes.ts';

function devlog(stage: string, data?: any) {
  if (process.env.PROD !== 'TRUE') {
    if (data) {
      console.log(`[DEV] ${stage}:`, data);
    } else {
      console.log(`[DEV] ${stage}`);
    }
  }
}

async function fetchAllStats(apikey: string, ign: string, bearer: string, uuid?: string) {
  devlog('Starting fetchAllStats', { ign, hasBearer: !!bearer, hasUuid: !!uuid });

  try {
    const startTime = performance.now();

    let finalUuid = uuid;

    if (!finalUuid) {
      devlog('Fetching UUID for username', { ign });
      const uuidResponse = await MCQuery(ign);
      devlog('UUID response', uuidResponse);

      if (uuidResponse === "Invalid Username") {
        throw new Error('Invalid Username');
      }

      if (!uuidResponse?.id) {
        throw new Error('Failed to get UUID');
      }

      finalUuid = uuidResponse.id;
    }

    devlog('UUID obtained', { uuid: finalUuid });

    // Fetch all stats in parallel using the individual fetch functions (which use hypixel wrapper internally)
    devlog('Fetching stats in parallel');
    const promises = [
      fetchBedwarsStats(apikey, finalUuid),
      fetchSkyblockStats(apikey, finalUuid),
      fetchGuildStats(apikey, finalUuid)
    ];

    // Only fetch capes if no bearer token (since bearer capes are fetched by getBearerIGN)
    if (!bearer) {
      promises.push(fetchCapes(apikey, finalUuid));
    }

    const results = await Promise.all(promises);
    devlog('All parallel fetch tasks completed');

    const [generalstats, sbstats, guildStats, capes] = bearer
      ? [...results, "None"] // Add "None" for capes when using bearer
      : results;

    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    devlog('Stats fetch complete', { timeTaken: `${timeTaken.toFixed(2)}ms` });

    const allStats = {
      generalstats,
      sbstats,
      guildStats,
      timeTaken,
      capes
    };

    return allStats;

  } catch (error) {
    devlog('Error in fetchAllStats', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

export default fetchAllStats;
