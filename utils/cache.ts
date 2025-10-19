import { Worker } from 'node:worker_threads';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worker = new Worker(path.join(process.cwd(), 'utils', 'fetch', 'worker.ts'));

const pending: Record<string, (value: any) => void> = {};

worker.on('message', (msg) => {
  if (msg && msg.id && pending[msg.id]) {
    pending[msg.id](msg.result);
    delete pending[msg.id];
  }
});

function getCacheKey(type: string, key: string) {
  return `${type}:${key}`;
}

export function getCache(type: string, key: string): Promise<any | undefined> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);
    pending[id] = resolve;
    worker.postMessage({ action: 'get', id, cacheKey: getCacheKey(type, key) });
  });
}

export function setCache(type: string, key: string, data: any): Promise<boolean> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);
    pending[id] = resolve;
    worker.postMessage({
      action: 'set',
      id,
      cacheKey: getCacheKey(type, key),
      data,
      expires: Date.now() + CACHE_DURATION
    });
  });
} 