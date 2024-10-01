const { parentPort } = require("worker_threads");
const { createClient } = require("redis");

async function pruneCacheData(data) {
  const { configs: redisConfig } = data;
  const redisClient = createClient({
    url: `redis://${redisConfig.host}:${redisConfig.port}`,
  });
  redisClient.connect().catch(console.error);

  const requestHits = await redisClient.hGetAll("request_hits");
  const entries = Object.entries(requestHits).map(([hash, count]) => ({
    hash,
    count: parseInt(count),
  }));
  const sorted = entries
    .filter((e) => e.count >= 10)
    .sort((a, b) => b.count - a.count);
  const top100 = sorted.slice(0, 100);

  const topHashes = top100.map((e) => e.hash);

  const allHashes = Object.keys(requestHits);
  const toRemove = allHashes.filter((hash) => !topHashes.includes(hash));

  for (const hash of toRemove) {
    await redisClient.hDel("request_filters", hash);
    await redisClient.hDel("request_responses", hash);
  }

  redisClient.quit();
}

if (parentPort) {
  parentPort.on("message", (data) => {
    pruneCacheData(data).then(() => {
      parentPort.postMessage(true);
    });
  });
}
