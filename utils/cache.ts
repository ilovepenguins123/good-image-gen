import { getSharedWorker, registerMessageHandler, removeMessageHandler } from './sharedWorker.ts';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pending: Record<string, (value: any) => void> = {};

function getCacheKey(type: string, key: string) {
  return `${type}:${key}`;
}

export function getCache(type: string, key: string): Promise<any | undefined> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (pending[id]) {
        delete pending[id];
        removeMessageHandler(id);
        resolve(undefined); // Return undefined on timeout
      }
    }, 10000); // 10 second timeout

    const handler = (message: any) => {
      clearTimeout(timeout);
      if (pending[id]) {
        pending[id](message.result);
        delete pending[id];
      }
      removeMessageHandler(id); // Ensure cleanup
    };

    pending[id] = resolve;
    registerMessageHandler(id, handler);

    const worker = getSharedWorker();
    worker.postMessage({ action: 'get', id, cacheKey: getCacheKey(type, key) });
  });
}

export function setCache(type: string, key: string, data: any): Promise<boolean> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (pending[id]) {
        delete pending[id];
        removeMessageHandler(id);
        resolve(false); // Return false on timeout
      }
    }, 10000); // 10 second timeout

    const handler = (message: any) => {
      clearTimeout(timeout);
      if (pending[id]) {
        pending[id](message.result);
        delete pending[id];
      }
      removeMessageHandler(id); // Ensure cleanup
    };

    pending[id] = resolve;
    registerMessageHandler(id, handler);

    const worker = getSharedWorker();
    worker.postMessage({
      action: 'set',
      id,
      cacheKey: getCacheKey(type, key),
      data,
      expires: Date.now() + CACHE_DURATION
    });
  });
} 