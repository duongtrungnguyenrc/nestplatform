import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";

export type ProviderContext = {
  instance: any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  metatype: Function;
  wrapper: InstanceWrapper;
};

export type MethodContext = ProviderContext & {
  methodName: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  methodRef: Function;
};

export interface IFeatureExplorer {
  /**
   * called once per provider
   */
  onProvider?(ctx: ProviderContext): void;

  /**
   * called once per method
   */
  onMethod?(ctx: MethodContext): void;

  /**
   * called after scan finished
   */
  onFinish?(): void;
}
