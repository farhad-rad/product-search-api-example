import path from "path";
import { Worker } from "worker_threads";

type Workers = "pruneCache" | "invalidateCache";

export class ChildProcessService {
  public static signal(workerName: Workers, data?: any): void {
    const workerPath = path.join(
      __dirname,
      "..",
      "workers",
      `${workerName}.js`
    );
    const worker = new Worker(workerPath);
    worker.postMessage(data);
    worker.on("message", (result) => {
      console.log(`Result from worker thread: ${result}`);
      worker.terminate();
    });
    worker.on("error", (error) => {
      console.error(`Error in worker thread: ${error}`);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }
}
