#!/bin/bash

echo "Building with TypeScript"
yarn build

echo "Generating the Runner package.json"
yarn ts-node source/scripts/generate-runner-deps.ts

echo "Installing the deps"
cd ../runner
yarn install
cd ../api

echo "Copying over the node_modules"
cp -rf ../runner/node_modules out

echo "Trimming any dts files"
./scripts/trim_node_modules.sh

echo "Zipping and uploading"
zip runner.zip -r out
aws lambda publish-layer-version --layer-name peril-staging-runtime --zip-file fileb://runner.zip --profile peril
rm runner.zip
