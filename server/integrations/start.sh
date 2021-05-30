#!/bin/sh

export $(grep -v '^#' integrations/.env | grep -v -e '^$' | xargs)

## Start server
./node_modules/.bin/ts-node-dev src/index.ts
