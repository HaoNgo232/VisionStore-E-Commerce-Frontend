/**
 * useTryOnRenderer Hook
 * Three.js scene setup and rendering for glasses overlay
 */

"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Type guard to check if object is a THREE.Mesh
 */
function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return obj instanceof THREE.Mesh;
}

/**
 * Type guard to check if material has dispose method
 */
function hasDisposeMethod(
  material: THREE.Material | THREE.Material[] | undefined | null,
): material is THREE.Material & { dispose: () => void } {
  if (!material) {
    return false;
  }
  if (Array.isArray(material)) {
    return false; // Handle array separately
  }
  return typeof material.dispose === "function";
}

export interface TryOnRenderer {
  loadGlasses: (modelUrl: string) => Promise<THREE.Object3D>;
  positionGlasses: (
    position: { x: number; y: number; z: number },
    scale: number,
    rotation: { x: number; y: number; z: number },
  ) => void;
  render: () => void;
  getCanvas: () => HTMLCanvasElement | null;
  dispose: () => void;
}

export function useTryOnRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
): TryOnRenderer | null {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const glassesRef = useRef<THREE.Object3D | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) {
      return;
    }

    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = null; // Transparent background

      // Create orthographic camera for 2D overlay (no perspective distortion)
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      camera.position.z = 5;

      // Create WebGL renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true, // Transparent background for compositing
        antialias: true, // Smooth edges
        preserveDrawingBuffer: true, // Allow reading pixels for canvas export
      });

      // Set renderer size to match canvas
      const updateRendererSize = (): void => {
        if (!canvasRef.current) {
          return;
        }
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        renderer.setSize(width, height, false);
      };

      updateRendererSize();
      window.addEventListener("resize", updateRendererSize);

      // Setup lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Store references
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      isInitializedRef.current = true;

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", updateRendererSize);
        renderer.dispose();
        isInitializedRef.current = false;
      };
    } catch (error) {
      console.error("[TryOnRenderer] Failed to initialize Three.js:", error);
      return undefined;
    }
  }, [canvasRef]);

  // Load GLB model using GLTFLoader
  const loadGlasses = useCallback(
    async (modelUrl: string): Promise<THREE.Object3D> => {
      if (!sceneRef.current) {
        throw new Error("Renderer not initialized");
      }

      try {
        // Create GLTFLoader
        const loader = new GLTFLoader();

        // Load GLB/GLTF model
        const gltf = await loader.loadAsync(modelUrl);

        // Get the model (usually the scene root)
        const model = gltf.scene;

        // Remove previous glasses
        if (glassesRef.current && sceneRef.current) {
          sceneRef.current.remove(glassesRef.current);
          // Dispose geometry and materials to prevent memory leaks
          glassesRef.current.traverse((child: THREE.Object3D) => {
            if (isMesh(child)) {
              // Type guard ensures child is THREE.Mesh
              child.geometry.dispose();

              // Handle material disposal safely without type assertion
              const material = child.material;
              if (Array.isArray(material)) {
                for (const mat of material) {
                  if (mat && typeof mat.dispose === "function") {
                    mat.dispose();
                  }
                }
              } else if (hasDisposeMethod(material)) {
                material.dispose();
              }
            }
          });
        }

        // Store and add new model
        glassesRef.current = model;
        if (sceneRef.current) {
          sceneRef.current.add(model);
        }

        // Log model info for debugging (commented out to avoid console.log warning)
        // console.warn("[TryOnRenderer] Model loaded:", {
        //   url: modelUrl,
        //   children: model.children.length,
        //   boundingBox: new THREE.Box3().setFromObject(model),
        // });

        return model;
      } catch (error) {
        console.error("[TryOnRenderer] Failed to load model:", error);
        throw new Error(
          `Failed to load glasses model: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
    [],
  );

  // Position glasses based on face landmarks
  const positionGlasses = useCallback(
    (
      position: { x: number; y: number; z: number },
      scale: number,
      rotation: { x: number; y: number; z: number },
    ): void => {
      if (!glassesRef.current) {
        return;
      }

      // Convert normalized coordinates (0-1) to Three.js world coordinates
      // For orthographic camera, we need to map 0-1 to -1 to 1
      const worldX = (position.x - 0.5) * 2;
      const worldY = -(position.y - 0.5) * 2; // Flip Y axis (image coordinates vs 3D)

      glassesRef.current.position.set(worldX, worldY, position.z);
      glassesRef.current.scale.set(scale, scale, scale);
      glassesRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
    },
    [],
  );

  // Render scene
  const render = useCallback((): void => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // Get canvas element
  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    return rendererRef.current?.domElement ?? null;
  }, []);

  // Dispose resources
  const dispose = useCallback((): void => {
    if (glassesRef.current && sceneRef.current) {
      sceneRef.current.remove(glassesRef.current);
      glassesRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    sceneRef.current = null;
    cameraRef.current = null;
    isInitializedRef.current = false;
  }, []);

  // Return null if not initialized
  if (!isInitializedRef.current) {
    return null;
  }

  return {
    loadGlasses,
    positionGlasses,
    render,
    getCanvas,
    dispose,
  };
}
