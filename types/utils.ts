/**
 * Utility types for improved type safety
 */

/**
 * Make certain properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make certain properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Non-nullable type
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Branded types for better type safety
 */
export type Brand<T, B> = T & { __brand: B };

export type ProductId = Brand<string, "ProductId">;
export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;
export type AddressId = Brand<string, "AddressId">;

/**
 * Helper to create branded ID
 */
export function createProductId(id: string): ProductId {
  return id as ProductId;
}

export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createOrderId(id: string): OrderId {
  return id as OrderId;
}

export function createAddressId(id: string): AddressId {
  return id as AddressId;
}

/**
 * Ensure array type
 */
export type EnsureArray<T> = T extends any[] ? T : T[];

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type
 */
export type Maybe<T> = T | null | undefined;

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Helper functions for Result type
 */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(
  result: Result<T, E>,
): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isErr<T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } {
  return result.ok === false;
}
