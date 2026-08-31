#!/bin/bash
images=$(find public src/assets -type f \( -name "*.png" -o -name "*.jpeg" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" \))
for img in "$images"; do
  # actually $images is space-separated but find with newlines is better handled with while read
  echo "---"
done
