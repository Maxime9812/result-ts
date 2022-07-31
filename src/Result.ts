/**
 * A discriminated union that encapsulates a successful outcome with a value of type T or a failure with an arbitrary Error exception.
 */
import { createFailure, Failure } from './Failure';
import { runCatching } from './utils';

export class Result<T> {
  protected constructor(private readonly value: any) {
    Object.freeze(this);
  }

  /**
   * Returns true if this instance represents a successful outcome. In this case isFailure returns false.
   */
  public get isSuccess(): boolean {
    return !this.isFailure;
  }

  /***
   * Returns true if this instance represents a failed outcome. In this case isSuccess returns false.
   */
  public get isFailure(): boolean {
    return this.value instanceof Failure;
  }

  /**
   * Returns the encapsulated value if this instance represents success or null if it is failure.
   * This function is a shorthand for getOrElse(null) (see getOrElse) or fold(() => this, () => null) (see fold).
   */
  public getOrNull(): T | null {
    return this.isSuccess ? this.value : null;
  }

  /**
   * Returns the encapsulated Throwable exception if this instance represents failure or null if it is success.
   * This function is a shorthand for fold(() => null,(exception) => exception) (see fold).
   */
  public exceptionOrNull(): Error | null {
    if (this.value instanceof Failure) {
      return this.value.exception;
    }
    return null;
  }

  /**
   * Throws exception if the result is failure. This internal function minimizes inlined bytecode for getOrThrow and makes sure that in the future we can add some exception-augmenting logic here (if needed).
   */
  public throwOnFailure() {
    if (this.value instanceof Failure) {
      throw this.value.exception;
    }
  }

  /**
   * Returns the encapsulated value if this instance represents success or throws the encapsulated Throwable exception if it is failure.
   * This function is a shorthand for getOrElse((exception) => throw exception) (see getOrElse).
   */
  public getOrThrow(): T {
    this.throwOnFailure();
    return this.value as T;
  }

  /**
   * Returns the encapsulated value if this instance represents success or the result of onFailure function for the encapsulated Throwable exception if it is failure.
   * Note, that this function rethrows any Throwable exception thrown by onFailure function.
   * This function is a shorthand for fold((value) => value, () => {}) (see fold).
   */
  public getOrElse<R>(onFailure: (exception: Error) => R): R | T {
    if (this.isFailure) {
      return onFailure(this.exceptionOrNull()!);
    }
    return this.value as T;
  }

  /**
   * Returns the encapsulated value if this instance represents success or the defaultValue if it is failure.
   * This function is a shorthand for getOrElse(defaultValue) (see getOrElse).
   */
  public getOrDefault<R>(defaultValue: R): R | T {
    if (this.isFailure) return defaultValue;
    return this.value;
  }

  /**
   * Returns the result of onSuccess for the encapsulated value if this instance represents success or the result of onFailure function for the encapsulated Throwable exception if it is failure.
   * Note, that this function rethrows any Throwable exception thrown by onSuccess or by onFailure function.
   */
  public fold<R>(onSuccess: (value: T) => R, onFailure: (exception: Error) => R): R {
    return this.isSuccess ? onSuccess(this.value) : onFailure(this.exceptionOrNull()!);
  }

  /**
   * Returns the encapsulated result of the given transform function applied to the encapsulated value if this instance represents success or the original encapsulated Throwable exception if it is failure.
   * Note, that this function rethrows any Throwable exception thrown by transform function. See mapCatching for an alternative that encapsulates exceptions.
   */
  public map<R>(transform: (value: T) => R): Result<R> {
    return this.isSuccess ? Result.success(transform(this.value as T)) : Result.failure(this.exceptionOrNull()!);
  }

  /**
   * Returns the encapsulated result of the given transform function applied to the encapsulated value if this instance represents success or the original encapsulated Throwable exception if it is failure.
   * This function catches any Throwable exception thrown by transform function and encapsulates it as a failure. See map for an alternative that rethrows exceptions from transform function.
   */
  public mapCatching<R>(transform: (value: T) => R): Result<R> {
    return this.isSuccess ? runCatching(() => transform(this.value as T)) : Result.failure(this.exceptionOrNull()!);
  }

  /**
   * Returns the encapsulated result of the given transform function applied to the encapsulated Throwable exception if this instance represents failure or the original encapsulated value if it is success.
   * Note, that this function rethrows any Throwable exception thrown by transform function. See recoverCatching for an alternative that encapsulates exceptions.
   */
  public recover<R>(transform: (exception: Error) => R): Result<R> {
    const exception = this.exceptionOrNull();
    if (exception) {
      return Result.success(transform(exception));
    } else {
      return this as unknown as Result<R>;
    }
  }

  /**
   * Returns the encapsulated result of the given transform function applied to the encapsulated Throwable exception if this instance represents failure or the original encapsulated value if it is success.
   * This function catches any Throwable exception thrown by transform function and encapsulates it as a failure. See recover for an alternative that rethrows exceptions.
   */
  public recoverCatching<R>(transform: (exception: Error) => R): Result<R> {
    const exception = this.exceptionOrNull();
    if (exception) {
      return runCatching(() => transform(exception));
    } else {
      return this as unknown as Result<R>;
    }
  }

  /**
   * Performs the given action on the encapsulated Throwable exception if this instance represents failure. Returns the original Result unchanged.
   */
  public onFailure(action: (exception: Error) => void): Result<T> {
    if (this.isFailure) {
      action(this.exceptionOrNull()!);
    }
    return this;
  }

  /**
   * Performs the given action on the encapsulated value if this instance represents success. Returns the original Result unchanged.
   */
  public onSuccess(action: (value: T) => void): Result<T> {
    if (this.isSuccess) {
      action(this.value);
    }
    return this;
  }

  /**
   * Returns an instance that encapsulates the given value as successful value.
   */
  public static success<T>(value: T | null = null): Result<T> {
    return new Result<T>(value);
  }

  /**
   * Returns an instance that encapsulates the given Throwable as failure.
   */
  public static failure<T>(exception: Error): Result<T> {
    return new Result<T>(createFailure(exception));
  }
}
