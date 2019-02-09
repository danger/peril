// // WIP

// import { Document, model, Schema } from "mongoose"

// interface InstallationAnalytics extends Document {
//   iID: number
//   numberOfRuns: number
//   totalTime: number
// }

// const InstallationAnalyticsModel = model<InstallationAnalytics>(
//   "InstallationAnalytics",
//   new Schema({
//     iID: Number,
//     numberOfRuns: Number,
//     totalTime: Number,
//   })
// )

// export const installationAnalytics = () => ({
//   updateAnalyticsForInstallation: (installationID: number, runID: string) =>
//     InstallationAnalyticsModel.findOne({ iID: installationID, runID }),
// })
