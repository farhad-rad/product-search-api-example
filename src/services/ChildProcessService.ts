import { createClient, RedisClientType } from "redis";
import { createHash } from "crypto";

export class ChildProcessService {
  private static instance: ChildProcessService;

  private constructor() {}

  public static getInstance(): ChildProcessService {
    return (ChildProcessService.instance ??= new ChildProcessService());
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
