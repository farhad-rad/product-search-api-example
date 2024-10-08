import { RedisClientType } from "redis";
import { createHash } from "crypto";
import { IProductFilters } from "../models/IProductFilters";
import { getRedisClient } from "../lib/redisClient";

export class CacheService {
  private static instance: CacheService;
  public static getInstance(): CacheService {
    return (CacheService.instance ??= new CacheService());
  }

  private _client: RedisClientType | null = null;
  public get client() {
    return (this._client ??= getRedisClient());
  }

  private generateRequestSignatureHash(filters: IProductFilters): string {
    return createHash("sha256").update(JSON.stringify(filters)).digest("hex");
  }

  async getCachedResult(filters: any): Promise<any | null> {
    const hash = this.generateRequestSignatureHash(filters);
    const result = await this.client.hGet("request_responses", hash);
    return result ? JSON.parse(result) : null;
  }

  async cacheResult(filters: any, result: any): Promise<void> {
    const hash = this.generateRequestSignatureHash(filters);

    await this.client.hIncrBy("request_hits", hash, 1);
    const totalHits = await this.client.hGet("request_hits", hash);
    if (totalHits && parseInt(totalHits) >= 10) {
      await this.client.hSet("request_filters", hash, JSON.stringify(filters));
      await this.client.hSet("request_responses", hash, JSON.stringify(result));
    }
  }
}
