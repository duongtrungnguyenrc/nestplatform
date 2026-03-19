import { TransactionalOptions } from "../types";
export declare const Transactional: (options?: TransactionalOptions) => ClassDecorator & MethodDecorator;
export declare const NoTransactional: () => MethodDecorator;
