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

/**
 * Upload AR snapshot request
 */
export interface UploadARSnapshotRequest {
  productId: string;
  image: File | string; // File or base64
}

/**
 * AR snapshot response
 */
export interface ARSnapshotResponse {
  success: boolean;
  snapshot: ARSnapshot;
}
