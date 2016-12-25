require("./globals")  // tslint:disable-line

import * as express from "express"
const bodyParser = require("body-parser")  // tslint:disable-line
import {integrationInstallation} from "./github/events/integration_installation"
import {ping} from "./github/events/ping"
import {pullRequest} from "./github/events/pull_request"

// Error logging
process.on("unhandledRejection", (reason: string, p: any) => {
  console.log("Error: ", reason)  // tslint:disable-line
})

const app = express()

app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/webhook", (req, res, next) => {
  const event = req.header("X-GitHub-Event")
  switch (event) {
    case "ping": {
      ping(req, res)
      break
    }
    case "integration_installation": {
      integrationInstallation(req, res)
      break
    }
    case "pull_request": {
      pullRequest(req, res)
      break
    }
    default: {
      res.status(404).send("Yo, this ain't done yet")
    }
  }
})

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)  // tslint:disable-line
})
