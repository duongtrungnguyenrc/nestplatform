import { Injectable } from "@nestjs/common";

import { IFeatureExplorer, FeatureExplorer, MethodContext, ProviderContext } from "@nestplatform/common";

import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";
import { TransactionalOptions } from "./types";
import { TransactionalEventPublisher } from "./transactional-event.publisher";

@Injectable()
@FeatureExplorer()
export class TransactionalMetadataExplorer implements IFeatureExplorer {
  /**
   * Stores class-level @Transactional() options, keyed by class constructor.
   * Used to apply class-level defaults to all methods of the class.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  private readonly classLevelOptions = new Map<Function, TransactionalOptions>();

  constructor(
    private readonly metadataAccessor: TransactionalMetadataAccessor,
    private readonly featureDecoration: TransactionalFeatureDecoration,
    private readonly eventPublisher: TransactionalEventPublisher,
  ) {}

  /**
   * Scan each provider for class-level @Transactional() metadata.
   */
  onProvider(ctx: ProviderContext): void {
    const { metatype } = ctx;

    const classOptions: TransactionalOptions | undefined = this.metadataAccessor.getTransactionalMetadata(metatype);

    if (classOptions) {
      this.classLevelOptions.set(metatype, classOptions);
    }
  }

  /**
   * Scan each method for @Transactional()/@NoTransactional() or @TransactionalEventListener() metadata.
   * Class-level options serve as defaults; method-level options override them.
   */
  onMethod(ctx: MethodContext): void {
    const { instance, methodName, methodRef, metatype } = ctx;

    // Check for transactional event listener
    const listenerMetadata = this.metadataAccessor.getEventListenerMetadata(methodRef);
    if (listenerMetadata) {
      this.eventPublisher.registerListener({
        ...listenerMetadata,
        callback: (payload: any) => methodRef.apply(instance, [payload]),
      });
    }

    // Check if method is explicitly excluded from transaction management
    const isExcluded: boolean | undefined = this.metadataAccessor.getNoTransactionalMetadata(methodRef);

    if (isExcluded) return;

    // Method-level options take highest priority
    const methodOptions: TransactionalOptions | undefined = this.metadataAccessor.getTransactionalMetadata(methodRef);

    // Class-level options as fallback
    const classOptions: TransactionalOptions | undefined = this.classLevelOptions.get(metatype);

    // Merge: method-level overrides class-level
    const resolvedOptions: TransactionalOptions | undefined = methodOptions ? { ...classOptions, ...methodOptions } : classOptions;

    // Check for declarative event publishing (@TransactionalEvent)
    const eventMetadata = this.metadataAccessor.getTransactionalEventMetadata(methodRef);

    if (eventMetadata) {
      const eventPublisher = this.eventPublisher;
      const originalMethod = methodRef;

      /**
       * Inner wrapper that publishes an event after successful execution.
       * If called within a transaction, publishing is deferred.
       */
      const wrappedWithEvent = async function (this: any, ...args: any[]) {
        const result = await originalMethod.apply(this, args);
        const payload = eventMetadata.payload ? eventMetadata.payload(result) : result;
        await eventPublisher.publish(eventMetadata.event, payload);
        return result;
      };

      if (resolvedOptions) {
        // Case: Both @Transactional and @TransactionalEvent are present
        this.featureDecoration.wrapMethodWithTransaction(instance, methodName, wrappedWithEvent, resolvedOptions);
      } else {
        // Case: ONLY @TransactionalEvent is present
        instance[methodName] = wrappedWithEvent.bind(instance);
      }
    } else if (resolvedOptions) {
      // Case: ONLY @Transactional is present
      this.featureDecoration.wrapMethodWithTransaction(instance, methodName, methodRef, resolvedOptions);
    }
  }
}
