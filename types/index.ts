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
  AsyncState,
} from "./common.types";

export {
  createApiError,
  ApiErrorSchema,
  createPaginatedResponseSchema,
  cuidSchema,
  preprocessImageUrls,
  preprocessDateString,
  preprocessNullableCuid,
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

export {
  UserRole,
  UserRoleSchema,
  UserSchema,
  AuthResponseSchema,
  TokenRefreshResponseSchema,
  VerifyTokenResponseSchema,
} from "./auth.types";

// User Types
export type {
  UserProfile,
  UpdateProfileRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ListUsersQuery,
  ListUsersResponse,
} from "./user.types";

export {
  UpdateProfileRequestSchema,
  UpdateUserRequestSchema,
  ListUsersQuerySchema,
  ListUsersResponseSchema,
} from "./user.types";

// Product Types
export type {
  Product,
  ProductFilters,
  ProductSortBy,
  CreateProductRequest,
  UpdateProductRequest,
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductQueryParams,
  ProductReview,
  ProductAttributes,
} from "./product.types";

export {
  ProductSchema,
  ProductAttributesSchema,
  ProductReviewSchema,
} from "./product.types";

// Category Types
export type {
  Category,
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedCategoriesResponse,
} from "./category.types";

export {
  CategorySchema,
  PaginatedCategoriesResponseSchema,
} from "./category.types";

// Address Types
export type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressSuggestion,
} from "./address.types";

export { AddressSchema } from "./address.types";

// Cart Types
export type {
  CartItem,
  Cart,
  SyncCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartWithProductsResponse,
} from "./cart.types";

export {
  CartSchema,
  CartItemSchema,
  CartWithProductsResponseSchema,
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

export {
  OrderStatus,
  PaymentStatus,
  OrderStatusSchema,
  PaymentStatusSchema,
  OrderSchema,
  OrderItemSchema,
  PaginatedOrdersResponseSchema,
} from "./order.types";

// Payment Types
export type {
  Payment,
  PaymentProcessRequest,
  PaymentProcessResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./payment.types";

export {
  PaymentMethod,
  PaymentMethodSchema,
  PaymentStatusSchema as PaymentStatusSchemaFromPayment,
  PaymentSchema,
  PaymentProcessResponseSchema,
} from "./payment.types";
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

export {
  ARSnapshotSchema,
  PaginatedARSnapshotsResponseSchema,
} from "./ar.types";
