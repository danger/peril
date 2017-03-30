require("./globals")  // tslint:disable-line
import * as express from "express"

const bodyParser = require("body-parser")  // tslint:disable-line
import webhook from "./router"

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

app.post("/webhook", webhook)

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`) // tslint:disable-line
})
