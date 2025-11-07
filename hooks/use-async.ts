import { useState, useCallback } from "react";
import type { AsyncState } from "@/types";
import { createApiError } from "@/types";

/**
 * Type-safe hook for async operations
 */
export function useAsync<T, Args extends unknown[] = []>(): AsyncState<T> & {
  execute: (asyncFunction: (...args: Args) => Promise<T>, ...args: Args) => Promise<{ ok: true; value: T } | { ok: false; error: ReturnType<typeof createApiError> }>;
  reset: () => void;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
} {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(
    async (asyncFunction: (...args: Args) => Promise<T>, ...args: Args) => {
      setState({ status: "loading" });

      try {
        const data = await asyncFunction(...args);
        setState({ status: "success", data });
        return { ok: true as const, value: data };
      } catch (error) {
        const apiError =
          error instanceof Error
            ? createApiError("ASYNC_ERROR", error.message)
            : createApiError("UNKNOWN_ERROR", "An unknown error occurred");

        setState({ status: "error", error: apiError });
        return { ok: false as const, error: apiError };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}

/**
 * Example usage:
 *
 * const { execute, isLoading, isSuccess, data, error } = useAsync<Product>()
 *
 * const handleFetch = async () => {
 *   const result = await execute(productService.getProductById, productId)
 *   if (result.ok) {
 *     console.log(result.value) // TypeScript knows this is Product
 *   } else {
 *     console.error(result.error) // TypeScript knows this is ApiError
 *   }
 * }
 */
