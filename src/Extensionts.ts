import {Result} from "./Result";

declare global {
    interface Function {
        /**
         * Calls the specified function block with this value as its receiver and returns its encapsulated result if invocation was successful, catching any Throwable exception that was thrown from the block function execution and encapsulating it as a failure.
         */
        runCatching<R>(): Result<R>;
    }
}

Function.prototype.runCatching = function <R>(): Result<R> {
    try {
        return Result.success(this())
    } catch(e) {
        return Result.failure(e as Error)
    }
}