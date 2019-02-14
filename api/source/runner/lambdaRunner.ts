import * as awsSDK from "aws-sdk"
import { getDB } from "../db/getDB"
import { MongoDB } from "../db/mongo"
import logger from "../logger"

export const invokeLambda = (name: string, payloadString: string) => {
  const lambda = new awsSDK.Lambda()
  return lambda.invokeAsync({ FunctionName: name, InvokeArgs: payloadString }, undefined).promise()
}

// Switch to 2 funcs?
export const updateLambdasToLatestLayers = async () => {
  const lambda = new awsSDK.Lambda()
  // https://console.aws.amazon.com/lambda/home?region=us-east-1#/layers
  // TODO: Prod vs Staging
  const layerName = "peril-staging-runtime"
  const allLayers = await lambda.listLayers({}).promise()
  const { data } = allLayers.$response

  if (data && data.Layers) {
    const thisLayer = data.Layers.find(l => l.LayerName === layerName)
    if (!thisLayer) {
      logger.error(`Could not find a layer for ${layerName}`)
    } else {
      const db = getDB() as MongoDB
      const lambdaInstallations = await db.getLambdaBasedInstallations()
      lambdaInstallations.forEach(installation => {
        const layers = [thisLayer.LayerName!]
        lambda.updateFunctionConfiguration({ FunctionName: installation.lambdaName, Layers: layers })
      })
    }
  }
}
