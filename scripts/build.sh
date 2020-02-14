#!/bin/sh

set -e

rm -rf node_modules
rm -rf app.zip

zip -r app.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store*" \
  -x "*.eslint*" \
  -x ".env*" \
  -x "*scripts*"
