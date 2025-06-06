const { parentPort, workerData } = require('worker_threads');
const { renderSkin } = require('./skin-renderer/index.cjs');

try {
  const { skinBuffer, isSlim } = workerData;
  const renderedSkin = renderSkin(skinBuffer, isSlim, true);
  parentPort.postMessage({ buffer: renderedSkin });
} catch (error) {
  parentPort.postMessage({ error: error.message });
} 