/**
 * Validation Utilities
 * Runtime validation helpers using Zod for API responses
 */

import { z } from "zod";

export class ValidationError extends Error {
  constructor(message: string, public details: z.ZodError) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate API response against Zod schema
 * @param data - Raw response data from API
 * @param schema - Zod schema to validate against
 * @param context - Optional context for error messages (e.g., endpoint name)
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string,
): T {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Log validation errors in development for debugging
      if (process.env.NODE_ENV === "development") {
        // Group errors by path to see patterns
        const errorsByPath = error.errors.reduce((acc, e) => {
          const path = e.path.join(".");
          acc[path] = acc[path] ?? [];
          acc[path].push({
            message: e.message,
            code: e.code,
          });
          return acc;
        }, {} as Record<string, { message: string; code: string }[]>);

        // Get actual values for failed paths
        const getNestedValue = (
          obj: unknown,
          path: (string | number)[],
        ): unknown => {
          let current: unknown = obj;
          for (const key of path) {
            if (current === null || current === undefined) {
              return undefined;
            }
            if (typeof current === "object" && key in current) {
              current = (current as Record<string | number, unknown>)[key];
            } else {
              return undefined;
            }
          }
          return current;
        };

        // Log full response data for debugging
        const fullResponseData =
          typeof data === "object" && data !== null
            ? JSON.stringify(data, null, 2)
            : String(data);

        console.error(`[Validation Error] ${context ?? "Response"}:`, {
          totalErrors: error.errors.length,
          errorsByPath,
          allErrors: error.errors.map((e) => {
            const pathStr = e.path.join(".");
            const receivedValue = getNestedValue(data, e.path);
            return {
              path: pathStr,
              message: e.message,
              code: e.code,
              received: receivedValue,
              receivedType: typeof receivedValue,
            };
          }),
          // Log full response data (not truncated)
          fullResponseData,
          // Also log as object for easier inspection
          responseObject: data,
          // Log data type info
          dataType: typeof data,
          isArray: Array.isArray(data),
          isNull: data === null,
          keys:
            typeof data === "object" && data !== null ? Object.keys(data) : [],
        });
      }
      // Log full error details to console with expanded data
      console.error(`[ValidationError] Full Error Details:`, {
        context,
        totalErrors: error.errors.length,
        errors: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
          code: e.code,
          // Only include expected/received if they exist
          ...("expected" in e && { expected: e.expected }),
          ...("received" in e && { received: e.received }),
        })),
        message: error.message,
        rawResponseData: data,
      });

      throw new ValidationError(
        `Invalid ${context ?? "response"} format from backend`,
        error,
      );
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Safe parse - returns result instead of throwing
 */
export function safeValidateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
