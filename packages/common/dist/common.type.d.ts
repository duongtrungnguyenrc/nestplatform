import type { DynamicModule, InjectionToken, OptionalFactoryDependency, Provider, Type } from "@nestjs/common";
export type ModuleConfigBase = {
    global?: boolean;
    extraModules?: (Type | DynamicModule)[];
    extraProviders?: (Type | Provider)[];
    extraExports?: (Type | Provider | InjectionToken)[];
    injectionToken?: InjectionToken;
};
export type ModuleConfigAsync<T> = {
    inject?: (InjectionToken | OptionalFactoryDependency)[];
    useFactory: (...args: any[]) => Promise<T> | T;
};
export type PlainObject = Record<string, any>;
