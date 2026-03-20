import { Injectable, Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { MetadataAccessor } from "@nestplatform/common";

import {
  NO_TRANSACTIONAL_METADATA,
  TRANSACTIONAL_METADATA,
  TRANSACTIONAL_EVENT_LISTENER_METADATA,
  TRANSACTIONAL_EVENT_METADATA,
} from "./transactional.constant";
import { TransactionalOptions, TransactionalEventOptions } from "./types";

/**
 * Service that reads transactional metadata from decorated classes and methods.
 *
 * @internal This class is used internally by the `TransactionalMetadataExplorer`.
 */
@Injectable()
export class TransactionalMetadataAccessor extends MetadataAccessor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  /**
   * Returns @Transactional() metadata from a class or method.
   *
   * @param target The target class or method
   * @returns TransactionalOptions or undefined
   */
  public getTransactionalMetadata(target: Function | Type<any>): TransactionalOptions | undefined {
    return this.reflector.get(TRANSACTIONAL_METADATA, target);
  }

  /**
   * Returns @NoTransactional() metadata from a method.
   *
   * @param target The target method
   * @returns boolean or undefined
   */
  public getNoTransactionalMetadata(target: Function | Type<any>): boolean | undefined {
    return this.reflector.get(NO_TRANSACTIONAL_METADATA, target);
  }

  /**
   * Returns @TransactionalEventListener() metadata from a method.
   *
   * @param target The target method
   * @returns TransactionalEventOptions or undefined
   */
  public getEventListenerMetadata(target: Function | Type<any>): any | undefined {
    return this.reflector.get(TRANSACTIONAL_EVENT_LISTENER_METADATA, target);
  }

  /**
   * Returns @TransactionalEvent() metadata from a method.
   *
   * @param target The target method
   * @returns TransactionalEventOptions & { event: string } or undefined
   */
  public getTransactionalEventMetadata(target: Function | Type<any>): (TransactionalEventOptions & { event: string }) | undefined {
    return this.reflector.get(TRANSACTIONAL_EVENT_METADATA, target);
  }

  /**
   * Checks if the target has transactional metadata.
   *
   * @param target The target class or method
   * @returns boolean
   */
  public isTransactional(target: Function | Type<any>): boolean {
    return !!this.getTransactionalMetadata(target);
  }
}
