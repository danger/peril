import * as express from 'express'
const bodyParser = require('body-parser')
import {ping} from "./github/events/ping"
import {integrationInstallation} from "./github/events/integration_installation"
import * as pg from "pg"

require("./globals")

const db = new pg.Client("localhost")
// db.connect()

// Error logging
process.on("unhandledRejection", (reason: string, p: any) => {
  console.log("Error: ", reason)
})

const app = express();

app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/webhook", (req, res, next) => {
  const event = req.header("X-GitHub-Event")
  switch(event) {
    case "ping": {
      ping(req, res)
      break;
    }
    case "integration_installation": {
      integrationInstallation(req, res, db)
      break;
    }
    default: {
      res.status(404).send("Yo, this ain't done yet")
    }
  }
  
})

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)
})
