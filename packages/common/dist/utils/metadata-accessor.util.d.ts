import { Reflector } from "@nestjs/core";
import { Type } from "@nestjs/common";
export declare abstract class MetadataAccessor {
    protected abstract readonly reflector: Reflector;
    protected getMetadata<T>(key: string | symbol, target: Function | Type): T | undefined;
}
