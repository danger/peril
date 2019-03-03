// import * as awsSDK from "aws-sdk"
// import { getDB } from "../../../db/getDB"

// export const getCloudWatchForInstallation = async (iID: number, time: string) => {
//   const installation = await getDB().getInstallation(iID)
//   if (!installation || !installation.lambdaName) {
//     return undefined
//   }

//   const logs = new awsSDK.CloudWatchLogs()
//   const groups = await logs.describeLogGroups({ logGroupNamePrefix: installation.lambdaName }, undefined).promise
// }
