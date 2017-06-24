import * as express from "express"
import * as xhub from "express-x-hub"
import { PERIL_WEBHOOK_SECRET } from "./globals"

const bodyParser = require("body-parser") // tslint:disable-line
import logger from "./logger"
import webhook from "./routing/router"

// Error logging
process.on("unhandledRejection", (reason: string, p: any) => {
  console.log("Error: ", reason) // tslint:disable-line
  throw reason
})

const app = express()
app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(xhub({ algorith: "sha1", secret: PERIL_WEBHOOK_SECRET }))
app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/webhook", webhook)

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`) // tslint:disable-line
  logger.info("Started up server.")
})
