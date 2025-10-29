import { Worker } from 'node:worker_threads';
import * as path from 'node:path';

// Single shared worker instance
let sharedWorker: Worker | null = null;
const messageHandlers = new Map<string, (message: any) => void>();

export function getSharedWorker() {
  if (!sharedWorker) {
    console.log('[DEV] Creating shared worker');
    sharedWorker = new Worker(path.join(process.cwd(), 'utils', 'fetch', 'worker.ts'));

    // Set up global message handler to route messages to correct handlers
    sharedWorker.on('message', (message: any) => {
      console.log('[DEV] Shared worker message received', { id: message.id, hasError: !!message.error });
      const handler = messageHandlers.get(message.id);
      if (handler) {
        handler(message);
        messageHandlers.delete(message.id);
      } else {
        console.log('[DEV] No handler found for message', {
          id: message.id,
          availableHandlers: Array.from(messageHandlers.keys()).slice(0, 5) // Show first 5 to avoid spam
        });
      }
    });

    sharedWorker.on('error', (error) => {
      console.log('[DEV] Shared worker error', { error });
    });

    sharedWorker.on('exit', (code) => {
      console.log('[DEV] Shared worker exited', { code });
      sharedWorker = null; // Reset worker so it can be recreated
      messageHandlers.clear(); // Clear all pending handlers
    });
  }
  return sharedWorker;
}

export function registerMessageHandler(id: string, handler: (message: any) => void) {
  messageHandlers.set(id, handler);
}

export function removeMessageHandler(id: string) {
  messageHandlers.delete(id);
}