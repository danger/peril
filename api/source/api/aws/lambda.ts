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

  const layer = await getLatestLayer()
  await lambda
    .createFunction(
      {
        FunctionName: name,
        MemorySize: 512,
        Layers: [layer.LatestMatchingVersion!.LayerVersionArn!],
        Timeout: 30,
        Code: {
          ZipFile: lambdaZip,
        },
        Role: "arn:aws:iam::656992703780:role/peril-minimal-access",
        Runtime: "nodejs8.10",
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

export const invokeLambda = (name: string, payloadString: string) => {
  const lambda = new awsSDK.Lambda()
  return lambda.invokeAsync({ FunctionName: name, InvokeArgs: payloadString }, undefined).promise()
}

export const getLatestLayer = async () => {
  const lambda = new awsSDK.Lambda()

  const isProd = process.env.PRODUCTION === "true"
  const runtime = isProd ? "production" : "staging"
  const layerName = `peril-${runtime}-runtime`

  const allLayers = await lambda.listLayers({}).promise()
  const { data } = allLayers.$response
  if (data && data.Layers) {
    const thisLayer = data.Layers.find(l => l.LayerName === layerName)
    if (!thisLayer) {
      throw new Error("Could not get find layer from AWS")
    }

    return thisLayer
  }

  throw new Error("Could not get the layer from AWS")
}
