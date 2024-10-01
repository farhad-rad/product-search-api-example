const { parentPort } = require("worker_threads");
const { createClient } = require("redis");

async function invalidateCache(data) {
  const { configs: redisConfig, product: newProduct } = data;
  const redisClient = createClient({
    url: `redis://${redisConfig.host}:${redisConfig.port}`,
  });
  redisClient.connect().catch(console.error);

  const requestFilters = await redisClient.hGetAll("request_filters");

  for (const [hash, filtersString] of Object.entries(requestFilters)) {
    const filters = JSON.parse(filtersString);

    const matchesName = !filters.name || newProduct.name.includes(filters.name);
    const matchesCategory =
      !filters.category || newProduct.category === filters.category;
    const matchesPriceMin =
      !filters.priceMin || newProduct.price >= filters.priceMin;
    const matchesPriceMax =
      !filters.priceMax || newProduct.price <= filters.priceMax;

    if (matchesName && matchesCategory && matchesPriceMin && matchesPriceMax) {
      await redisClient.hDel("request_filters", hash);
      await redisClient.hDel("request_responses", hash);
    }
  }

  redisClient.quit();
}

if (parentPort) {
  parentPort.on("message", (data) => {
    invalidateCache(data).then(() => {
      parentPort.postMessage(true);
    });
  });
}
