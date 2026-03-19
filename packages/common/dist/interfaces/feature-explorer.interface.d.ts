import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
export type ProviderContext = {
    instance: any;
    metatype: Function;
    wrapper: InstanceWrapper;
};
export type MethodContext = ProviderContext & {
    methodName: string;
    methodRef: Function;
};
export interface IFeatureExplorer {
    onProvider?(ctx: ProviderContext): void;
    onMethod?(ctx: MethodContext): void;
    onFinish?(): void;
}
