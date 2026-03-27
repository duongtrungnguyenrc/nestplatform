/**
 * Thrown when a distributed lock cannot be acquired because
 * the target resource is already locked by another process.
 */
export class ResourceLockedException extends Error {
  constructor(public readonly message: string) {
    super();
    this.name = "ResourceLockedException";
  }
}
