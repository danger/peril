import * as awsSDK from "aws-sdk"
import { readFileSync } from "fs"
import { join } from "path"

const lambdaZip = readFileSync(join(__dirname, "..", "..", "..", "bin", "lambda.zip"))

export const createLambdaFunctionForInstallation = async (installationName: string) => {
  const lambda = new awsSDK.Lambda()
  const isProd = process.env.PRODUCTION === "true"
  const prefix = isProd ? "p" : "s"
  const randoSuffix = Math.random()
    .toString(36)
    .substring(7)

  const name = `${prefix}-${installationName}-${randoSuffix}`

  const runtime = isProd ? "production" : "staging"
  const layerName = `peril-${runtime}-runtime`

  await lambda
    .createFunction(
      {
        FunctionName: name,
        MemorySize: 512,
        Layers: [layerName],
        Code: {
          ZipFile: lambdaZip,
        },
        Role: "peril-minimal-access",
        Runtime: "Node.js 8.10",
        Handler: "index.handler",
      },
      undefined
    )
    .promise()

  return {
    success: true,
    name,
  }
}

export const deleteLambdaFunctionNamed = (name: string) => {
  const lambda = new awsSDK.Lambda()
  return lambda.deleteFunction({ FunctionName: name }, undefined).promise()
}
