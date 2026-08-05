import { Injectable } from "@nestjs/common";

import { ITransactionAdapter, TransactionProxyContext } from "./interfaces";

type ObjectLike = Record<PropertyKey, any>;

@Injectable()
export class TransactionalProxyFactory {
  public createProxy<T extends object>(instance: T, adapter: ITransactionAdapter, adapterKey: string): T {
    const proxyCache = new WeakMap<object, any>();
    const context: TransactionProxyContext = { adapterKey };

    const proxyObject = <V extends object>(target: V): V => {
      if (proxyCache.has(target)) {
        return proxyCache.get(target);
      }

      const proxied = new Proxy(target as ObjectLike, {
        get: (proxyTarget, prop, receiver) => {
          const value: any = Reflect.get(proxyTarget, prop, receiver);

          const resolvedResource = adapter.proxyResource(value, context);
          if (resolvedResource !== undefined) {
            return resolvedResource.value;
          }

          if (typeof value === "function") {
            return function (...args: any[]) {
              return value.apply(receiver, args);
            };
          }

          if (!this.isProxyableObject(value)) {
            return value;
          }

          return proxyObject(value);
        },
      });

      proxyCache.set(target, proxied);

      return proxied as V;
    };

    return proxyObject(instance);
  }

  private isProxyableObject(value: any): value is object {
    if (!value || typeof value !== "object") {
      return false;
    }

    return !(
      value instanceof Promise ||
      value instanceof Date ||
      Array.isArray(value) ||
      value instanceof RegExp ||
      value instanceof Map ||
      value instanceof Set ||
      value instanceof WeakMap ||
      value instanceof WeakSet ||
      value instanceof ArrayBuffer
    );
  }
}
