import { Worker } from 'node:worker_threads';
import * as path from 'node:path';

// Single shared worker instance
let sharedWorker: Worker | null = null;
const messageHandlers = new Map<string, (message: any) => void>();
let workerIdleTimeout: NodeJS.Timeout | null = null;
const IDLE_TIMEOUT_MS = 30000; // 30 seconds idle timeout

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
      if (workerIdleTimeout) {
        clearTimeout(workerIdleTimeout);
        workerIdleTimeout = null;
      }
    });

    // Start idle timeout when worker is created
    resetIdleTimeout();
  }
  return sharedWorker;
}

export function registerMessageHandler(id: string, handler: (message: any) => void) {
  messageHandlers.set(id, handler);
  // Reset idle timeout when new task starts
  resetIdleTimeout();
}

export function removeMessageHandler(id: string) {
  messageHandlers.delete(id);
  // Reset idle timeout when task completes
  resetIdleTimeout();
}

export function terminateSharedWorker() {
  if (sharedWorker) {
    console.log('[DEV] Terminating shared worker');
    sharedWorker.terminate();
    sharedWorker = null;
    messageHandlers.clear();
  }
  if (workerIdleTimeout) {
    clearTimeout(workerIdleTimeout);
    workerIdleTimeout = null;
  }
}

function resetIdleTimeout() {
  if (workerIdleTimeout) {
    clearTimeout(workerIdleTimeout);
  }
  workerIdleTimeout = setTimeout(() => {
    if (messageHandlers.size === 0) {
      console.log('[DEV] Worker idle timeout reached, terminating worker');
      terminateSharedWorker();
    }
  }, IDLE_TIMEOUT_MS);
}

// Gracefully terminate worker on process exit
process.on('SIGTERM', () => {
  console.log('[DEV] Received SIGTERM, cleaning up worker');
  terminateSharedWorker();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[DEV] Received SIGINT, cleaning up worker');
  terminateSharedWorker();
  process.exit(0);
});

process.on('beforeExit', () => {
  console.log('[DEV] Process beforeExit, cleaning up worker');
  terminateSharedWorker();
});