import { PlainObject } from "./common.type";

export function deepMerge<T, U>(target: T, source: U): T & U {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source] as T & U;
  }

  if (target instanceof Set && source instanceof Set) {
    return new Set([...target, ...source]) as T & U;
  }

  if (target instanceof Map && source instanceof Map) {
    const merged = new Map(target);

    for (const [key, sourceValue] of source.entries()) {
      if (merged.has(key)) {
        const targetValue = merged.get(key);
        merged.set(key, isMergeable(targetValue, sourceValue) ? deepMerge(targetValue, sourceValue) : sourceValue);
      } else {
        merged.set(key, sourceValue);
      }
    }

    return merged as T & U;
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const result: PlainObject = { ...target };

    for (const key of Object.keys(source)) {
      if (key in target) {
        const tVal = (target as PlainObject)[key];
        const sVal = (source as PlainObject)[key];

        result[key] = isMergeable(tVal, sVal) ? deepMerge(tVal, sVal) : sVal;
      } else {
        result[key] = (source as PlainObject)[key];
      }
    }

    return result as T & U;
  }

  return source as T & U;
}

function isMergeable(a: any, b: any): boolean {
  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) return true;
  if (a instanceof Set && b instanceof Set) return true;
  if (a instanceof Map && b instanceof Map) return true;

  return !!(isPlainObject(a) && isPlainObject(b));
}

export const isPlainObject = (value: any): value is PlainObject => {
  return (value !== null && typeof value === "object" && !Array.isArray(value)) || Object.prototype.toString.call(value) === "[object Object]";
};

export const stringifyMethod = (methodName: string, ...args: any[]) => {
  return `${methodName}(${args
    .map(String)
    .map((arg) => (arg.length > 10 ? arg.substring(0, 9) + "..." : arg))
    .join(", ")})`;
};

export function mergeWithDefaults<T extends PlainObject = any, O = T>(defaults: T, overrides?: Partial<T>): O {
  if (!overrides) return { ...defaults } as unknown as O;

  const result: PlainObject = { ...defaults };

  for (const key of Object.keys(overrides)) {
    const overrideValue: T[string] | undefined = overrides[key];

    if (overrideValue === undefined) continue;

    const defaultValue: any = defaults[key];

    if (isPlainObject(defaultValue) && isPlainObject(overrideValue)) {
      result[key] = mergeWithDefaults(defaultValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  }

  return result as O;
}
