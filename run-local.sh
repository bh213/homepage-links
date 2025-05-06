#!/bin/bash

export APP_LISTEN_ADDR=:8080
export APP_YAML_PATH=demo/config.yaml
export APP_CACHE_SECONDS=0

go run main.go 