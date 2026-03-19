"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyMethod = exports.isPlainObject = void 0;
exports.deepMerge = deepMerge;
function deepMerge(target, source) {
    if (Array.isArray(target) && Array.isArray(source)) {
        return [...target, ...source];
    }
    if (target instanceof Set && source instanceof Set) {
        return new Set([...target, ...source]);
    }
    if (target instanceof Map && source instanceof Map) {
        const merged = new Map(target);
        for (const [key, sourceValue] of source.entries()) {
            if (merged.has(key)) {
                const targetValue = merged.get(key);
                merged.set(key, isMergeable(targetValue, sourceValue) ? deepMerge(targetValue, sourceValue) : sourceValue);
            }
            else {
                merged.set(key, sourceValue);
            }
        }
        return merged;
    }
    if ((0, exports.isPlainObject)(target) && (0, exports.isPlainObject)(source)) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (key in target) {
                const tVal = target[key];
                const sVal = source[key];
                result[key] = isMergeable(tVal, sVal) ? deepMerge(tVal, sVal) : sVal;
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    return source;
}
function isMergeable(a, b) {
    if (a == null || b == null)
        return false;
    if (Array.isArray(a) && Array.isArray(b))
        return true;
    if (a instanceof Set && b instanceof Set)
        return true;
    if (a instanceof Map && b instanceof Map)
        return true;
    return !!((0, exports.isPlainObject)(a) && (0, exports.isPlainObject)(b));
}
const isPlainObject = (value) => {
    return (value !== null && typeof value === "object" && !Array.isArray(value)) || Object.prototype.toString.call(value) === "[object Object]";
};
exports.isPlainObject = isPlainObject;
const stringifyMethod = (methodName, ...args) => {
    return `${methodName}(${args
        .map(String)
        .map((arg) => (arg.length > 10 ? arg.substring(0, 9) + "..." : arg))
        .join(", ")})`;
};
exports.stringifyMethod = stringifyMethod;
//# sourceMappingURL=common.helpers.js.map