import {Result} from "./Result";

/**
 * Calls the specified function block and returns its encapsulated result if invocation was successful, catching any Throwable exception that was thrown from the block function execution and encapsulating it as a failure.
 */
export function runCatching<R>(callback: () => R): Result<R> {
    try {
        return Result.success(callback())
    } catch(e) {
        return Result.failure(e as Error)
    }
}