import { createClient, RedisClientType } from "redis";
import { createHash } from "crypto";

export class CacheService {
  private static instance: CacheService;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({ url: "redis://localhost:3202" });
    this.client.connect();
  }

  public static getInstance(): CacheService {
    return (CacheService.instance ??= new CacheService());
  }

  private generateRequestSignatureHash(filters: any): string {
    const filterString = `${filters.name || ""}_${filters.category || ""}_${
      filters.priceMin || ""
    }_${filters.priceMax || ""}_${filters.createdSince || ""}_${
      filters.page || 1
    }`;
    return createHash("sha256").update(filterString).digest("hex");
  }

  async getCachedResult(filters: any): Promise<any | null> {
    const hash = this.generateRequestSignatureHash(filters);
    const result = await this.client.hGet("request_responses", hash);
    return result ? JSON.parse(result) : null;
  }

  async cacheResult(filters: any, result: any): Promise<void> {
    const hash = this.generateRequestSignatureHash(filters);

    await this.client.hIncrBy("request_hits", hash, 1);
    await this.client.hSet("request_filters", hash, JSON.stringify(filters));
    await this.client.hSet("request_responses", hash, JSON.stringify(result));

    this.runCacheMaintenance();
  }

  private runCacheMaintenance(): void {
    // const child = fork(
    //   path.resolve(__dirname, "../child_processes/cacheInvalidationProcess.js")
    // );
    // child.send({ product });
  }

  async invalidateAffectedResults(newProduct: any): Promise<void> {
    // TODO: call child process to invalidate cached results that might be affected by product change
  }
}
