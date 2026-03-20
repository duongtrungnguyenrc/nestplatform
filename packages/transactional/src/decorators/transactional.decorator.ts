import { SetMetadata } from "@nestjs/common";

import { NO_TRANSACTIONAL_METADATA, TRANSACTIONAL_METADATA } from "../transactional.constant";
import { TransactionalOptions } from "../types";

/**
 * Decorator that marks a class or method to be executed within a transaction.
 *
 * When applied to a class, all methods within that class will be transactional.
 * When applied to a method, it overrides class-level transactional settings.
 *
 * @param options - Transactional options including propagation, isolation, and rollback behavior.
 *
 * @example
 * // Method-level
 * @Transactional()
 * async createOrder(dto: CreateOrderDto) { ... }
 *
 * // Class-level
 * @Transactional()
 * @Injectable()
 * export class PaymentService { ... }
 */
export function Transactional(options?: TransactionalOptions): MethodDecorator & ClassDecorator {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    SetMetadata(TRANSACTIONAL_METADATA, options || {})(target, key!, descriptor!);
  };
}

/**
 * Decorator that explicitly marks a method to be excluded from transaction management,
 * even if the class is decorated with `@Transactional`.
 *
 * @example
 * @Transactional()
 * @Injectable()
 * export class PaymentService {
 *     @NoTransactional()
 *     async getPaymentStatus(id: string) { ... } // Not wrapped in transaction
 * }
 */
export function NoTransactional(): MethodDecorator {
  return SetMetadata(NO_TRANSACTIONAL_METADATA, true);
}
