import { createClient, RedisClientType } from "redis";
import { Configuration } from "../utils/Configuration";

let redisClient: RedisClientType;

export const getRedisClient = () => {
  const redisConfig = Configuration.get("cache");
  if (!redisClient) {
    redisClient = createClient({
      url: `redis://${redisConfig.host}:${redisConfig.port}`,
    });
    redisClient.connect().catch(console.error);
  }
  return redisClient;
};
