import { Reflector } from "@nestjs/core";
import { Type } from "@nestjs/common";

export abstract class MetadataAccessor {
  protected abstract readonly reflector: Reflector;

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected getMetadata<T>(key: string | symbol, target: Function | Type): T | undefined {
    const isObject: boolean = typeof target === "object" ? target !== null : typeof target === "function";

    return isObject ? this.reflector.get(key, target) : undefined;
  }
}
