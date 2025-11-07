/**
 * Global Type Definitions
 * Central export point for all types used across the application
 */

// Common Types
export type {
  ApiError,
  PaginatedResponse,
  ApiResponse,
  ApiResponseWithMeta,
} from "./common.types";

// Auth Types
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  VerifyTokenResponse,
} from "./auth.types";

export { UserRole } from "./auth.types";

// User Types
export type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ListUsersResponse,
} from "./user.types";

// Product Types
export type {
  Product,
  ProductFilters,
  ProductSortBy,
  CreateProductRequest,
  UpdateProductRequest,
  ProductReview,
} from "./product.types";

// Category Types
export type {
  Category,
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./category.types";

// Address Types
export type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressSuggestion,
} from "./address.types";

// Cart Types
export type {
  CartItem,
  Cart,
  SyncCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "./cart.types";

// Order Types
export type {
  Order,
  OrderItem,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilters,
  PaginatedOrdersResponse,
} from "./order.types";

export { OrderStatus, PaymentStatus } from "./order.types";

// Payment Types
export type {
  Payment,
  PaymentProcessRequest,
  PaymentProcessResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./payment.types";

export { PaymentMethod } from "./payment.types";
// Note: PaymentStatus is exported from order.types

// AR Types
export type {
  ARSnapshot,
  ARSnapshotResponse,
  PaginatedARSnapshotsResponse,
  ARSnapshotCreateResponse,
  UploadARSnapshotRequest,
  SalesSummaryResponse,
  ProductPerformanceResponse,
  UserCohortResponse,
  DateRangeQuery,
} from "./ar.types";
