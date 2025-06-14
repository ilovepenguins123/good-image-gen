import { Worker } from 'node:worker_threads';
import MCQuery from './MCQuery.ts';
import { getCache, setCache } from '../cache.ts';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

function devlog(stage: string, data?: any) {
  if (process.env.PROD !== 'TRUE') {
    if (data) {
      console.log(`[DEV] ${stage}:`, data);
    } else {
      console.log(`[DEV] ${stage}`);
    }
  }
}

const workerPath = path.join(process.cwd(), 'utils', 'fetch', 'worker.ts');
let worker: Worker | null = null;

function getWorker() {
  if (!worker) {
    devlog('Creating new worker');
    worker = new Worker(workerPath);
  }
  return worker;
}

function runTask(task: any) {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const taskId = Math.random().toString(36).slice(2);
    devlog('Running task', { type: task.type, taskId });
    
    const messageHandler = (message: any) => {
      if (message.id === taskId) {
        worker.removeListener('message', messageHandler);
        if (message.error) {
          devlog('Task error', { type: task.type, error: message.error });
          reject(new Error(message.error));
        } else {
          devlog('Task complete', { type: task.type });
          resolve(message.result);
        }
      }
    };
    
    worker.on('message', messageHandler);
    worker.postMessage({ ...task, id: taskId });
  });
}

async function fetchAllStats(apikey: string, ign: string, bearer: string, uuid?: string) {
  const cacheKey = `${apikey}:${ign}`;
  devlog('Checking cache', { cacheKey });
  
  const cached = await getCache('allstats', cacheKey);
  if (cached) {
    devlog('Using cached stats');
    return cached;
  }

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
      { type: 'skyblock', apikey, uuid: finalUuid },
      { type: 'guildStats', apikey, uuid: finalUuid }
    ];

    // Only fetch capes if no bearer token (since bearer capes are fetched by getBearerIGN)
    if (!bearer) {
      tasks.push({ type: 'capes', apikey, uuid: finalUuid });
    }

    devlog('Running tasks in parallel');
    const results = await Promise.all(tasks.map(task => runTask(task)));
    devlog('All tasks completed');
    
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

    devlog('Caching stats');
    await setCache('allstats', cacheKey, allStats);
    devlog('Stats cached');
    
    return allStats;

  } catch (error) {
    devlog('Error in fetchAllStats', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

export default fetchAllStats;
