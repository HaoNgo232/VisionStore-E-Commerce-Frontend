/**
 * Canvas Utilities
 * Functions for compositing 3D renders on 2D images
 */

/**
 * Composite 3D render (from Three.js canvas) onto original 2D image
 * @param originalImage - Original uploaded image
 * @param glassesCanvas - Canvas element from Three.js renderer
 * @returns Composite canvas with image + glasses overlay
 */
export function compositeImageAndGlasses(
  originalImage: HTMLImageElement,
  glassesCanvas: HTMLCanvasElement,
): HTMLCanvasElement {
  // Create output canvas with same size as original image
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = originalImage.width;
  outputCanvas.height = originalImage.height;

  const ctx = outputCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Cannot get canvas context");
  }

  // Draw original image first
  ctx.drawImage(originalImage, 0, 0);

  // Draw glasses overlay (Three.js render)
  // Scale glasses canvas to match original image size
  ctx.drawImage(glassesCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

  return outputCanvas;
}

/**
 * Download canvas as PNG file
 * @param canvas - Canvas element to download
 * @param filename - Name for downloaded file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Cleanup
    URL.revokeObjectURL(url);
  }, "image/png");
}

/**
 * Convert canvas to Blob
 * @param canvas - Canvas element
 * @param mimeType - MIME type (default: image/png)
 * @returns Promise resolving to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType = "image/png",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(blob);
    }, mimeType);
  });
}
