require("./globals")  // tslint:disable-line
import * as express from "express"

const bodyParser = require("body-parser")  // tslint:disable-line
import {createInstallation} from "./github/events/create_installation"
import {ping} from "./github/events/ping"
import {pullRequest} from "./github/events/pull_request"

import * as winston from "winston"

// Error logging
process.on("unhandledRejection", (reason: string, p: any) => {
  console.log("Error: ", reason)  // tslint:disable-line
})

const app = express()
import "./setup_logger"

app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/webhook", (req, res, next) => {
  const event = req.header("X-GitHub-Event")
  winston.log("router", `Recieved ${event}:`)

  switch (event) {
    case "ping": {
      ping(req, res)
      break
    }
    case "integration_installation": {
      // note that deleting an create_installation
      // comes through this too with: "action": "deleted",
      winston.log("router", ` ${req.body.installation.action} on ${req.body.installation.account.login}`)
      createInstallation(req, res)
      break
    }
    case "pull_request": {
      winston.log("router", ` ${req.body.pr.action} on ${req.body.pr.account}`)
      pullRequest(req, res)
      break
    }
    default: {
      winston.log("router", ` unhandled - 404ing`)
      res.status(404).send("Yo, this ain't done yet")
    }
  }
})

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`) // tslint:disable-line
})
