#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo 'Please install the current Node.js LTS: https://nodejs.org/en/download'
  exit 1
fi
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' || {
  echo 'Please update to the current Node.js LTS.'
  exit 1
}
exec node server.mjs --open
