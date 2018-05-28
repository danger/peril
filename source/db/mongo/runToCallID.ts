import { Document, model, Schema } from "mongoose"

// We need to handle keeping track of a runID (danger run)
// so that it can be matched to a callID  (hyper run)
//
// See: https://forum.hyper.sh/t/access-call-id-for-current-func/835/1
//

export interface RunIDToCallID extends Document {
  iID: number
  callID: string
  runID: string
}

const RunIDToCallIDModel = model<RunIDToCallID>(
  "InstallationAnalytics",
  new Schema({
    iID: Number,
    callID: String,
    runID: String,
  })
)

export const runToCallIDFunctions = () => ({
  getCallIDForRun: async (installationID: number, runID: string) => {
    return await RunIDToCallIDModel.findOne({ iID: installationID, runID })
  },

  storeCallIDForRun: async (installationID: number, runID: string, callID: string) => {
    return await RunIDToCallIDModel.create([{ iID: installationID, runID, callID }])
  },

  removeCallIDForRun: async (installationID: number, runID: string) => {
    return await RunIDToCallIDModel.remove({ iID: installationID, runID })
  },
})
