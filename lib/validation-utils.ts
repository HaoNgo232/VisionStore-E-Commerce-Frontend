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
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[Validation Error] ${context ?? "Response"}:`, {
        errors: error.errors,
        data,
      });
      throw new ValidationError(
        `Invalid ${context ?? "response"} format from backend`,
        error,
      );
    }
    throw error;
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

