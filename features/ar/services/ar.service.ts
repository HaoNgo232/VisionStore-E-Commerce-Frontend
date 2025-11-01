/**
 * AR Service
 * Handles AR snapshots and virtual try-on operations
 */

import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  ARSnapshot,
  UploadARSnapshotRequest,
  ARSnapshotResponse,
} from "@/types";

export const arApi = {
  /**
   * Fetch all AR snapshots for current user
   */
  async getAll(): Promise<ARSnapshot[]> {
    return apiGet<ARSnapshot[]>("/ar/snapshots");
  },

  /**
   * Fetch single AR snapshot by ID
   */
  async getById(id: string): Promise<ARSnapshot> {
    return apiGet<ARSnapshot>(`/ar/snapshots/${id}`);
  },

  /**
   * Upload new AR snapshot
   */
  async upload(data: UploadARSnapshotRequest): Promise<ARSnapshotResponse> {
    // If image is a File, use FormData for multipart upload
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append("image", data.image);
      formData.append("productId", data.productId);
      return apiPost<ARSnapshotResponse>("/ar/snapshots", formData);
    }

    // Otherwise treat as base64 string
    return apiPost<ARSnapshotResponse>("/ar/snapshots", data);
  },

  /**
   * Delete AR snapshot
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/ar/snapshots/${id}`);
  },
};
