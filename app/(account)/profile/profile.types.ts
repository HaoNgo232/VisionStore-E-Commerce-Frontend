export type TabValue = "orders" | "addresses" | "profile"

/**
 * Type guard function to validate if a string is a valid TabValue
 */
export function isTabValue(value: string | null): value is TabValue {
  return value === "orders" || value === "addresses" || value === "profile"
}

