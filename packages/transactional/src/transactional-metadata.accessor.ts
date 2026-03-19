import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { MetadataAccessor } from "@nestplatform/common";

import { NO_TRANSACTIONAL_METADATA, TRANSACTIONAL_METADATA } from "./transactional.constant";
import { TransactionalOptions } from "./types";

@Injectable()
export class TransactionalMetadataAccessor extends MetadataAccessor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  /**
   * Get @Transactional() metadata from a class or method.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public getTransactionalMetadata(target: Function): TransactionalOptions | undefined {
    return this.getMetadata<TransactionalOptions>(TRANSACTIONAL_METADATA, target);
  }

  /**
   * Get @NoTransactional() metadata from a method.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public getNoTransactionalMetadata(target: Function): boolean | undefined {
    return this.getMetadata<boolean>(NO_TRANSACTIONAL_METADATA, target);
  }
}
