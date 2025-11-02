/**
 * AR (Augmented Reality) Types
 * Virtual try-on snapshots and AR related types

 */

export interface ARSnapshot {
  id: string;
  userId: string | null;
  productId: string;
  imageUrl: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedARSnapshotsResponse {
  snapshots: ARSnapshot[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ARSnapshotCreateResponse {
  id: string;
  imageUrl: string;
  createdAt: string;
}

/**
 * Upload AR snapshot request
 */
export interface UploadARSnapshotRequest {
  productId: string;
  imageUrl: string; // URL after upload
  metadata?: Record<string, unknown>;
}

/**
 * Sales summary report response
 */
export interface SalesSummaryResponse {
  fromAt: string; // Date serialized to string
  toAt: string;
  totalOrders: number;
  totalRevenueInt: number; // cents
  averageOrderValueInt: number; // cents
}

/**
 * Product performance report response
 */
export interface ProductPerformanceResponse {
  fromAt: string;
  toAt: string;
  products: Array<{
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenueInt: number; // cents
  }>;
}

/**
 * User cohort report response
 */
export interface UserCohortResponse {
  fromAt: string;
  toAt: string;
  newUsers: number;
  activeUsers: number;
  returningCustomers: number;
}

/**
 * Date range query parameters
 */
export interface DateRangeQuery {
  fromAt: string;
  toAt: string;
}
