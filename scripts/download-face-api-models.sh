#!/bin/bash

# Script to download face-api.js models
# Models will be saved to public/models/

MODELS_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Create models directory if it doesn't exist
mkdir -p "$MODELS_DIR"

echo "Downloading face-api.js models..."

# SSD Mobilenet V1 model files
echo "Downloading SSD Mobilenet V1 model..."
curl -o "$MODELS_DIR/ssd_mobilenetv1_model-weights_manifest.json" \
  "$BASE_URL/ssd_mobilenetv1_model-weights_manifest.json"

# Download weights files for SSD Mobilenet V1
for i in {1..16}; do
  curl -o "$MODELS_DIR/ssd_mobilenetv1_model-shard$i" \
    "$BASE_URL/ssd_mobilenetv1_model-shard$i" || echo "Failed to download shard $i"
done

# Face Landmark 68 model files
echo "Downloading Face Landmark 68 model..."
curl -o "$MODELS_DIR/face_landmark_68_model-weights_manifest.json" \
  "$BASE_URL/face_landmark_68_model-weights_manifest.json"

# Download weights files for Face Landmark 68
for i in {1..2}; do
  curl -o "$MODELS_DIR/face_landmark_68_model-shard$i" \
    "$BASE_URL/face_landmark_68_model-shard$i" || echo "Failed to download shard $i"
done

echo "Models downloaded to $MODELS_DIR"
echo "Please verify that all files are present."

