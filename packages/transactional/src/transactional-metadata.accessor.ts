import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { MetadataAccessor } from "@nestplatform/common";

import {
  NO_TRANSACTIONAL_METADATA,
  TRANSACTIONAL_METADATA,
  TRANSACTIONAL_EVENT_LISTENER_METADATA,
  TRANSACTIONAL_EVENT_METADATA,
} from "./transactional.constant";
import { TransactionalOptions, TransactionalEventOptions } from "./types";

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

  /**
   * Get @TransactionalEventListener() metadata from a method.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public getEventListenerMetadata(target: Function): any | undefined {
    return this.getMetadata<any>(TRANSACTIONAL_EVENT_LISTENER_METADATA, target);
  }

  /**
   * Get @TransactionalEvent() metadata from a method.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public getTransactionalEventMetadata(target: Function): (TransactionalEventOptions & { event: string }) | undefined {
    return this.getMetadata<TransactionalEventOptions & { event: string }>(TRANSACTIONAL_EVENT_METADATA, target);
  }
}
