import { Inject, Injectable, Logger } from "@nestjs/common";

import { FeatureDecoration, stringifyMethod } from "@nestplatform/common";

import { DEFAULT_TRANSACTION_ADAPTER, TRANSACTION_ADAPTERS } from "./transactional.constant";
import { ITransactionAdapter } from "./interfaces";
import { TransactionalOptions, TransactionAdapters, TransactionPropagation } from "./types";

const LOGGING_CONTEXT = "TransactionalModule";

@Injectable()
export class TransactionalFeatureDecoration extends FeatureDecoration {
  constructor(@Inject(TRANSACTION_ADAPTERS) private readonly adapters: TransactionAdapters) {
    super();
  }

  /**
   * Wrap a method with transaction management logic.
   * Resolves the correct adapter and delegates execution.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public wrapMethodWithTransaction(instance: any, methodName: string, originalMethod: Function, options: TransactionalOptions): void {
    const adapterKey: string = options.adapter || DEFAULT_TRANSACTION_ADAPTER;
    const fallbackAdapter: ITransactionAdapter | undefined = Object.values(this.adapters)[0];

    const adapter: ITransactionAdapter | undefined = this.adapters[adapterKey] || fallbackAdapter;

    if (!adapter) {
      if (options.logging) {
        Logger.warn(`Transaction adapter "${adapterKey}" not found. Skip wrapping for method ${methodName}.`, LOGGING_CONTEXT);
      }

      return;
    }

    instance[methodName] = async (...args: any[]): Promise<any> => {
      const methodString: string = stringifyMethod(methodName, ...args);

      if (options.logging) {
        Logger.log(`Starting transaction for \`${methodString}\` [${options.propagation || TransactionPropagation.REQUIRED}]`, LOGGING_CONTEXT);
      }

      try {
        const proxiedInstance = adapter.proxyInstance?.(instance);
        const result = await adapter.execute(() => originalMethod.apply(proxiedInstance || instance, args), {
          propagation: options.propagation || TransactionPropagation.REQUIRED,
          isolation: options.isolation,
        });

        if (options.logging) {
          Logger.log(`Transaction committed for \`${methodString}\``, LOGGING_CONTEXT);
        }

        return result;
      } catch (error) {
        if (options.logging) {
          Logger.error(`Transaction rolled back for \`${methodString}\`: ${error}`, LOGGING_CONTEXT);
        }

        throw error;
      }
    };
  }
}
