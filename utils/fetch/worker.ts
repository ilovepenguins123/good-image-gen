// worker.js
import { parentPort } from 'node:worker_threads';
import fetchBedwarsStats from './bedwars.ts';
import fetchSkyblockStats from './skyblock.ts';
import fetchGuildStats from './guild.ts';
import { fetchCapes } from './capes.ts';
import getcapesmc from './getcapesmc.ts';
if (!parentPort) {
  throw new Error('This module must be run as a worker thread');
}

const cache: Record<string, { data: any, expires: number }> = {};

parentPort.on('message', async (task) => {
  if (task.action === 'get') {
    const entry = cache[task.cacheKey];
    if (parentPort) {
      if (entry && entry.expires > Date.now()) {
        parentPort.postMessage({ id: task.id, result: entry.data });
      } else {
        parentPort.postMessage({ id: task.id, result: undefined });
      }
    }
    return;
  }
  if (task.action === 'set') {
    cache[task.cacheKey] = { data: task.data, expires: task.expires };
    if (parentPort) {
      parentPort.postMessage({ id: task.id, result: true });
    }
    return;
  }
  try {
    let result;
    switch (task.type) {
      case 'bedwars':
        result = await fetchBedwarsStats(task.apikey, task.uuid);
        break;
      case 'skyblock':
        result = await fetchSkyblockStats(task.apikey, task.uuid);
        break;
      case 'guildStats':
        result = await fetchGuildStats(task.apikey, task.uuid);
        break;
      case 'capes':
        if (task.bearer) {
          result = await getcapesmc(task.bearer);
        } else {
          result = await fetchCapes(task.apikey, task.uuid);
        }
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    if (!parentPort) {
      throw new Error('Lost connection to parent thread');
    }
    parentPort.postMessage({ id: task.id, result });
  } catch (error) {
    if (!parentPort) {
      throw new Error('Lost connection to parent thread');
    }
    // Return the error back to the main thread
    if (error instanceof Error) {
      parentPort.postMessage({ id: task.id, error: error.message });
    } else {
      parentPort.postMessage({ id: task.id, error: 'An unknown error occurred' });
    }
  }
});
