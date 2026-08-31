#!/bin/bash
find public src/assets -type f \( -name "*.png" -o -name "*.jpeg" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" \) | while read img; do
  basename=$(basename "$img")
  if ! grep -rqF "$basename" src index.html public; then
    echo "Untracking $img"
    git rm --cached "$img"
    echo "/$img" >> .gitignore
  fi
done
