#!/bin/bash

docker run --rm --name home-links \
  -p 8080:8080 \
  -e APP_CACHE_SECONDS=0 \
  -v "$(pwd)/demo:/data:ro" \
  bh213/homepage-links:latest 