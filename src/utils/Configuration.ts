import configuration from "../configs/configuration";
import { DeepFlatten } from "../contracts/DeepFlatten";

type ConfigObjectFull = DeepFlatten<ReturnType<typeof configuration>>;

export class Configuration {
  private static _data: ReturnType<typeof configuration> | null = null;
  private static accessKey<T extends keyof ConfigObjectFull>(
    key?: T
  ): ConfigObjectFull[T] | null {
    Configuration._data ??= configuration();
    let currentValue: any = this._data;
    if (key) {
      const path = key.split(".");
      for (let i = 0; i < path.length; i++) {
        currentValue = currentValue[path[i]];
        if (!currentValue) {
          return null;
        }
      }
    }
    return currentValue;
  }

  public static get<T extends keyof ConfigObjectFull>(
    key?: T
  ): ConfigObjectFull[T];
  public static get<T extends keyof ConfigObjectFull>(
    key: T,
    fallbackValue?: ConfigObjectFull[T]
  ): ConfigObjectFull[T];
  public static get<T extends keyof ConfigObjectFull>(
    key?: T,
    fallbackValue?: ConfigObjectFull[T]
  ): ConfigObjectFull[T] | undefined {
    return Configuration.accessKey(key) ?? fallbackValue;
  }
}
