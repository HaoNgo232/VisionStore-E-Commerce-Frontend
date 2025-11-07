/**
 * AR (Augmented Reality) Types
 * Virtual try-on snapshots and AR related types

 */

import { z } from "zod";

export interface ARSnapshot {
  id: string;
  userId: string | null;
  productId: string;
  imageUrl: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Zod schema for ARSnapshot
 */
export const ARSnapshotSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  productId: z.string().uuid(),
  imageUrl: z.string().url(),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
});

export interface ARSnapshotResponse {
  id: string;
  userId: string | null;
  productId: string;
  imageUrl: string; // URL của ảnh snapshot (user chụp với AR)
  metadata?: Record<string, unknown> | null; // Metadata như camera position, lighting, etc.
  createdAt: Date;
}

export interface PaginatedARSnapshotsResponse {
  snapshots: ARSnapshot[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Zod schema for PaginatedARSnapshotsResponse
 */
export const PaginatedARSnapshotsResponseSchema = z.object({
  snapshots: z.array(ARSnapshotSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

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
  image: File; // File object for the image
  metadata?: Record<string, unknown>;
}

/**
 * Sales summary report response
 */
export interface SalesSummaryResponse {
  fromAt: string; // Date serialized to string
  toAt: string;
  totalOrders: number;
  totalRevenueInt: number; // VND
  averageOrderValueInt: number; // VND
}

/**
 * Product performance report response
 */
export interface ProductPerformanceResponse {
  fromAt: string;
  toAt: string;
  products: {
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenueInt: number; // VND
  }[];
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
