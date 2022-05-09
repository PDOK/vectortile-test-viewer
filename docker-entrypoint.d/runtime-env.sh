#!/usr/bin/env bash

set -e

cd /usr/share/nginx/html

if [ -n "$RUNTIME_CONFIG" ]; then
  echo "RUNTIME_CONFIG:\n$RUNTIME_CONFIG"
  sed -i s$'\001''window.runtime_config="{}"'$'\001'"window.runtime_config=$RUNTIME_CONFIG"$'\001'g index.html
fi
