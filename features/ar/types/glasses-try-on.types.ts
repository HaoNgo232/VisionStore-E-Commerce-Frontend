/**
 * Glasses Try-On Types
 * Types for the simple glasses try-on feature
 */

import { z } from "zod";
import { cuidSchema } from "@/types/common.types";

/**
 * Product with try-on support
 * Extends Product with tryOnImageUrl field
 */
export interface ProductWithTryOn {
  id: string;
  name: string;
  priceInt: number;
  tryOnImageUrl: string; // URL ảnh PNG kính với nền trong suốt
  imageUrls: string[];
}

/**
 * Zod schema for ProductWithTryOn
 */
export const ProductWithTryOnSchema = z.object({
  id: cuidSchema(),
  name: z.string().min(1),
  priceInt: z.number().int().nonnegative(),
  tryOnImageUrl: z.string().url(), // Must be valid URL
  imageUrls: z.array(z.string().url()).default([]),
});

/**
 * Face landmarks detected from image
 */
export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose?: { x: number; y: number }; // Optional, for future use
  confidence: number; // Detection confidence score (0-1)
}

/**
 * Zod schema for FaceLandmarks
 */
export const FaceLandmarksSchema = z.object({
  leftEye: z.object({
    x: z.number(),
    y: z.number(),
  }),
  rightEye: z.object({
    x: z.number(),
    y: z.number(),
  }),
  nose: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  confidence: z.number().min(0).max(1),
});

/**
 * Glasses overlay configuration
 * Calculated from face landmarks to position glasses correctly
 */
export interface GlassesOverlayConfig {
  position: { x: number; y: number }; // Center position between eyes
  scale: number; // Scale factor based on eye distance
  rotation: number; // Rotation angle in radians (optional, simplified for now)
  width: number; // Scaled width
  height: number; // Scaled height
}

/**
 * Zod schema for GlassesOverlayConfig
 */
export const GlassesOverlayConfigSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  scale: z.number().positive(),
  rotation: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Try-on result
 * Contains original image, result image, and product info
 */
export interface TryOnResult {
  originalImage: string; // base64 data URL or blob URL
  resultImage: string; // base64 data URL or blob URL
  productId: string;
  productName: string;
  timestamp: number; // Unix timestamp
}

/**
 * Zod schema for TryOnResult
 */
export const TryOnResultSchema = z.object({
  originalImage: z.string().min(1),
  resultImage: z.string().min(1),
  productId: cuidSchema(),
  productName: z.string().min(1),
  timestamp: z.number().int().nonnegative(),
});

/**
 * API Response for products with try-on
 */
export interface ProductsWithTryOnResponse {
  data: ProductWithTryOn[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Zod schema for ProductsWithTryOnResponse
 */
export const ProductsWithTryOnResponseSchema = z.object({
  data: z.array(ProductWithTryOnSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

/**
 * Try-on error types
 */
export type TryOnErrorCode =
  | "PERMISSION_DENIED"
  | "NO_FACE_DETECTED"
  | "IMAGE_LOAD_FAILED"
  | "OVERLAY_FAILED"
  | "MODEL_LOAD_FAILED"
  | "UNKNOWN_ERROR";

/**
 * Try-on error
 */
export class TryOnError extends Error {
  constructor(message: string, public code: TryOnErrorCode) {
    super(message);
    this.name = "TryOnError";
  }
}
