import { createHash } from "node:crypto";

import { KeyBuilder } from "./interfaces";

/**
 * Extracts key(s) from a `KeyBuilder` definition.
 *
 * If the key builder is a function, it is called with the method arguments.
 * Otherwise, the static value is used directly.
 *
 * @param keyBuilder - A static key or a key builder function.
 * @param args - The method arguments to pass to the builder function.
 * @returns An array of resolved cache key strings.
 *
 * @internal
 */
function extract(keyBuilder: KeyBuilder<string | string[]>, args: any[]): string[] {
  const keys: string | string[] = typeof keyBuilder === "function" ? keyBuilder(...args) : keyBuilder;
  return Array.isArray(keys) ? keys : [keys];
}

/**
 * Generates composed cache keys by combining the method name or custom key
 * with an optional namespace prefix.
 *
 * When no custom key is provided, a key is auto-generated using the method name
 * and an MD5 hash of the serialized arguments: `methodName@<hash>`.
 *
 * If a namespace is provided, the final key format is: `namespace:key`.
 *
 * @param options - Key generation options including method name, custom key, namespace, and args.
 * @returns An array of fully composed cache key strings.
 *
 * @example
 * ```typescript
 * // With custom key
 * generateComposedKey({ key: 'my-key', namespace: 'users', methodName: 'find', args: [] });
 * // Returns: ['users:my-key']
 *
 * // Auto-generated key
 * generateComposedKey({ methodName: 'findById', args: ['123'] });
 * // Returns: ['findById@<md5-hash>']
 * ```
 *
 * @publicApi
 */
export function generateComposedKey(options: {
  key?: KeyBuilder<string | string[]>;
  namespace?: KeyBuilder<string>;
  methodName: string;
  args: any[];
}): string[] {
  let keys: string[];

  if (options.key) {
    keys = extract(options.key, options.args);
  } else {
    const hash: string = createHash("md5").update(JSON.stringify(options.args)).digest("hex");
    keys = [`${options.methodName}@${hash}`];
  }

  const namespace: string | string[] | undefined = options.namespace && extract(options.namespace, options.args);
  return keys.map((it: string): string => (namespace ? `${namespace[0]}:${it}` : it));
}
