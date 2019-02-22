#!/bin/bash

# Based on https://claudiajs.com/tutorials/aws-cli-tricks.html

echo Zipping up function

# -j = ignore files
# -X = ignore metadata (deterministic-ish builds)
zip bin/lambda.zip ../runner/index.js ../runner/tsconfig.json ../runner/.babelrc -j -X

# Grab all of the lambdas and scope it to only Peril staging instances
lambdas=$(aws lambda list-functions --profile peril --query 'Functions[?starts_with(FunctionName, `s-`)].FunctionName' --output text)

# Grab the current runtime ARN ( e.g. arn:aws:lambda:us-east-1:123456:layer:peril-staging-runtime:11 )
runtime=$(aws lambda list-layers --profile peril --query 'Layers[?starts_with(LayerName, `s-`)].LatestMatchingVersion.LayerVersionArn' --output text)

for lambda in $lambdas; do
  echo Updating the code for $lambda 
  aws lambda update-function-code --function-name $lambda --zip-file fileb://bin/lambda.zip --profile peril
done
