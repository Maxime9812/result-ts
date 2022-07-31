export class Failure {
  constructor(public readonly exception: Error) {}
  equals(other: any): boolean {
    return other instanceof Failure && other.exception === this.exception;
  }
}

/**
 * Creates an instance of internal marker Failure class to make sure that this class is not exposed in ABI
 */
export function createFailure(exception: Error): any {
  return new Failure(exception);
}
