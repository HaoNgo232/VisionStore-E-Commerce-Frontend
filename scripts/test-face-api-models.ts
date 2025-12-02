/* eslint-disable no-console */
/**
 * Test script to verify face-api.js models load correctly
 * Run with: pnpm tsx scripts/test-face-api-models.ts
 */

import * as faceapi from "face-api.js";

async function testModels(): Promise<void> {
  console.log("Testing face-api.js models...\n");

  try {
    console.log("Loading SSD Mobilenet V1 model...");
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    console.log("✅ SSD Mobilenet V1 loaded successfully\n");

    console.log("Loading Face Landmark 68 model...");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    console.log("✅ Face Landmark 68 loaded successfully\n");

    console.log("✅ All models loaded successfully!");
  } catch (error) {
    console.error("❌ Error loading models:", error);
    process.exit(1);
  }
}

// Note: This script needs to run in browser environment or with jsdom
// For now, just verify files exist
console.log(
  "Note: This script requires browser environment to actually load models.",
);
console.log("Models will be tested when the app runs.\n");

testModels().catch(console.error);
