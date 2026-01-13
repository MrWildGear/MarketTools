#!/bin/bash

# Script to update version numbers across all project files
# Usage: ./scripts/update-version.sh <version>

set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Error: Version number is required"
  echo "Usage: $0 <version>"
  exit 1
fi

# Validate version format (basic check for semantic versioning)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  echo "Warning: Version '$VERSION' doesn't match semantic versioning pattern (x.y.z)"
fi

echo "Updating version to $VERSION..."

# Update package.json
if [ -f "package.json" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
  else
    # Linux
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
  fi
  echo "✓ Updated package.json"
else
  echo "Warning: package.json not found"
fi

# Update src-tauri/tauri.conf.json
if [ -f "src-tauri/tauri.conf.json" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json
  else
    # Linux
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json
  fi
  echo "✓ Updated src-tauri/tauri.conf.json"
else
  echo "Warning: src-tauri/tauri.conf.json not found"
fi

# Update src-tauri/Cargo.toml
if [ -f "src-tauri/Cargo.toml" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^version = \"[^\"]*\"/version = \"$VERSION\"/" src-tauri/Cargo.toml
  else
    # Linux
    sed -i "s/^version = \"[^\"]*\"/version = \"$VERSION\"/" src-tauri/Cargo.toml
  fi
  echo "✓ Updated src-tauri/Cargo.toml"
else
  echo "Warning: src-tauri/Cargo.toml not found"
fi

echo "Version update complete!"
