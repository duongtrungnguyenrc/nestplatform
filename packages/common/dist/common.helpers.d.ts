import { PlainObject } from "./common.type";
export declare function deepMerge<T, U>(target: T, source: U): T & U;
export declare const isPlainObject: (value: any) => value is PlainObject;
export declare const stringifyMethod: (methodName: string, ...args: any[]) => string;
