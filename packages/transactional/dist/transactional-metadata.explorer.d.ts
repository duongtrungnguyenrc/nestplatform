import { IFeatureExplorer, MethodContext, ProviderContext } from "@nestplatform/common";
import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";
import { TransactionalEventPublisher } from "./transactional-event.publisher";
export declare class TransactionalMetadataExplorer implements IFeatureExplorer {
  private readonly metadataAccessor;
  private readonly featureDecoration;
  private readonly eventPublisher;
  private readonly classLevelOptions;
  constructor(
    metadataAccessor: TransactionalMetadataAccessor,
    featureDecoration: TransactionalFeatureDecoration,
    eventPublisher: TransactionalEventPublisher,
  );
  onProvider(ctx: ProviderContext): void;
  onMethod(ctx: MethodContext): void;
}
