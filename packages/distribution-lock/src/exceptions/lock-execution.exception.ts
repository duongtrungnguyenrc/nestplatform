/**
 * Thrown when an unexpected error occurs during the execution
 * of a lock-protected operation (e.g., connection failure, query error).
 */
export class LockExecutionException extends Error {
  constructor(
    public readonly message: string,
    /** The individual lock/unlock attempt promises, if available. */
    public readonly attempts?: ReadonlyArray<Promise<any>>,
  ) {
    super();
    this.name = "LockExecutionError";
  }
}
