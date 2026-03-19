import { IFeatureExplorer, MethodContext, ProviderContext } from "@nestplatform/common";
import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";
export declare class TransactionalMetadataExplorer implements IFeatureExplorer {
    private readonly metadataAccessor;
    private readonly featureDecoration;
    private readonly classLevelOptions;
    constructor(metadataAccessor: TransactionalMetadataAccessor, featureDecoration: TransactionalFeatureDecoration);
    onProvider(ctx: ProviderContext): void;
    onMethod(ctx: MethodContext): void;
}
