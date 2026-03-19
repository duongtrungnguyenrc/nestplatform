import { Reflector } from "@nestjs/core";
import { MetadataAccessor } from "@nestplatform/common";
import { TransactionalOptions } from "./types";
export declare class TransactionalMetadataAccessor extends MetadataAccessor {
    protected readonly reflector: Reflector;
    constructor(reflector: Reflector);
    getTransactionalMetadata(target: Function): TransactionalOptions | undefined;
    getNoTransactionalMetadata(target: Function): boolean | undefined;
}
