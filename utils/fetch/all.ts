import MCQuery from './MCQuery.ts';
import { getCache, setCache } from '../cache.ts';
import { getSharedWorker, registerMessageHandler, removeMessageHandler } from '../sharedWorker.ts';

function devlog(stage: string, data?: any) {
  if (process.env.PROD !== 'TRUE') {
    if (data) {
      console.log(`[DEV] ${stage}:`, data);
    } else {
      console.log(`[DEV] ${stage}`);
    }
  }
}

// Use shared worker for all operations

type TaskRequest = {
  type: string;
  timeoutMs?: number;
  [key: string]: unknown;
};

function runTask(task: TaskRequest) {
  return new Promise((resolve, reject) => {
    const worker = getSharedWorker();
    const taskId = Math.random().toString(36).slice(2);
    devlog('Running task', { type: task.type, taskId });

    // Set up timeout to prevent hanging
    const timeoutDuration = typeof task.timeoutMs === 'number' ? task.timeoutMs : 30000;
    const timeout = setTimeout(() => {
      removeMessageHandler(taskId);
      devlog('Task timeout', { type: task.type, taskId, timeoutDuration });
      const seconds = Math.round(timeoutDuration / 1000);
      reject(new Error(`Task ${task.type} timed out after ${seconds}s`));
    }, timeoutDuration);

    const messageHandler = (message: any) => {
      clearTimeout(timeout);
      removeMessageHandler(taskId); // Ensure cleanup
      devlog('Received message', { messageId: message.id, expectedId: taskId, matches: message.id === taskId });
      if (message.error) {
        devlog('Task error', { type: task.type, error: message.error });
        reject(new Error(message.error));
      } else {
        devlog('Task complete', { type: task.type });
        resolve(message.result);
      }
    };

    registerMessageHandler(taskId, messageHandler);
    const { timeoutMs, ...rest } = task;
    worker.postMessage({ ...rest, id: taskId });
  });
}

async function fetchAllStats(apikey: string, ign: string, bearer: string, uuid?: string) {
  const cacheKey = `${apikey}:${ign}${uuid ? `:${uuid}` : ''}`;
  devlog('Checking cache', { cacheKey });

  const cached = await getCache('allstats', cacheKey);
  if (cached) {
    devlog('Cache HIT - using cached stats', {
      cacheKey,
      hasGeneralStats: !!cached.generalstats,
      hasSkyblockStats: !!cached.sbstats,
      hasGuildStats: !!cached.guildStats
    });
    return cached;
  }

  devlog('Cache MISS - fetching fresh stats', { cacheKey });

  try {
    devlog('Starting stats fetch');
    const startTime = performance.now();

    let finalUuid = uuid;
    
    if (!finalUuid) {
      devlog('Fetching UUID');
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

    const tasks = [
      { type: 'bedwars', apikey, uuid: finalUuid },
      // Allow extra time for skyblock since networth calculations can take longer than other tasks
      { type: 'skyblock', apikey, uuid: finalUuid, timeoutMs: 90000 },
      { type: 'guildStats', apikey, uuid: finalUuid }
    ];

    // Only fetch capes if no bearer token (since bearer capes are fetched by getBearerIGN)
    if (!bearer) {
      tasks.push({ type: 'capes', apikey, uuid: finalUuid });
    }

    devlog('Running tasks in parallel');
    const taskPromises = tasks.map(task => runTask(task));
    devlog('Task promises created', { count: taskPromises.length });
    const results = await Promise.all(taskPromises);
    devlog('All tasks completed', { resultsCount: results.length });
    
    const [generalstats, sbstats, guildStats, capes] = bearer 
      ? [...results, "None"] // Add "None" for capes when using bearer
      : results;

    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    
    devlog('Stats fetch complete', { timeTaken });

    const allStats = {
      generalstats,
      sbstats,
      guildStats,
      timeTaken,
      capes
    };

    devlog('Caching stats', { cacheKey, hasData: !!allStats });
    try {
      await setCache('allstats', cacheKey, allStats);
      devlog('Stats cached successfully');
    } catch (cacheError) {
      devlog('Cache set failed', { error: cacheError });
      // Don't fail the whole operation if caching fails
    }
    
    return allStats;

  } catch (error) {
    devlog('Error in fetchAllStats', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

export default fetchAllStats;
