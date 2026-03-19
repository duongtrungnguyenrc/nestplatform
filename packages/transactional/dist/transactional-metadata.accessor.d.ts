import { Reflector } from "@nestjs/core";
import { MetadataAccessor } from "@nestplatform/common";
import { TransactionalOptions, TransactionalEventOptions } from "./types";
export declare class TransactionalMetadataAccessor extends MetadataAccessor {
  protected readonly reflector: Reflector;
  constructor(reflector: Reflector);
  getTransactionalMetadata(target: Function): TransactionalOptions | undefined;
  getNoTransactionalMetadata(target: Function): boolean | undefined;
  getEventListenerMetadata(target: Function): any | undefined;
  getTransactionalEventMetadata(target: Function):
    | (TransactionalEventOptions & {
        event: string;
      })
    | undefined;
}
