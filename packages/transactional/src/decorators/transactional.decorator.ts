import { applyDecorators, SetMetadata } from "@nestjs/common";

import { NO_TRANSACTIONAL_METADATA, TRANSACTIONAL_METADATA } from "../transactional.constant";
import { TransactionalOptions, TransactionPropagation } from "../types";

const TRANSACTIONAL_DEFAULTS: Required<Omit<TransactionalOptions, "adapter" | "isolation">> = {
  propagation: TransactionPropagation.REQUIRED,
  logging: false,
};

/**
 * Marks a class or method as transactional.
 *
 * - **Method-level**: Wraps the decorated method in a database transaction.
 * - **Class-level**: Wraps all methods of the class in transactions.
 *   Use `@NoTransactional()` on specific methods to opt-out.
 *
 * @example
 * // Method-level
 * @Transactional()
 * async createOrder(dto: CreateOrderDto) { ... }
 *
 * // Method-level with options
 * @Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })
 * async logAuditEvent(event: AuditEvent) { ... }
 *
 * // Class-level
 * @Transactional()
 * @Injectable()
 * export class PaymentService { ... }
 */
export const Transactional = (options?: TransactionalOptions): ClassDecorator & MethodDecorator => {
  const mergedOptions: TransactionalOptions = {
    ...TRANSACTIONAL_DEFAULTS,
    ...options,
  };

  return applyDecorators(SetMetadata(TRANSACTIONAL_METADATA, mergedOptions));
};

/**
 * Excludes a method from class-level `@Transactional()` wrapping.
 *
 * @example
 * @Transactional()
 * @Injectable()
 * export class PaymentService {
 *     @NoTransactional()
 *     async getPaymentStatus(id: string) { ... } // Not wrapped in transaction
 * }
 */
export const NoTransactional = (): MethodDecorator => {
  return applyDecorators(SetMetadata(NO_TRANSACTIONAL_METADATA, true));
};
