#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$ROOT_DIR/site"

if [[ ! -d "$ROOT_DIR/docs" ]]; then
  echo "❌ docs/ directory not found"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/mkdocs.yml" ]]; then
  echo "❌ mkdocs.yml not found at repository root"
  exit 1
fi

python3 -m venv /tmp/mkdocs-venv
source /tmp/mkdocs-venv/bin/activate
pip install --quiet mkdocs mkdocs-material
mkdocs build --clean --site-dir "$OUTPUT_DIR"
deactivate

echo "✅ Documentation built: $OUTPUT_DIR/index.html"
