"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataAccessor = void 0;
class MetadataAccessor {
    getMetadata(key, target) {
        const isObject = typeof target === "object" ? target !== null : typeof target === "function";
        return isObject ? this.reflector.get(key, target) : undefined;
    }
}
exports.MetadataAccessor = MetadataAccessor;
//# sourceMappingURL=metadata-accessor.util.js.map