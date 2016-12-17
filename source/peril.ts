import * as express from 'express';
import bodyParser from "body-parser"

require("./globals")

// Error logging
process.on("unhandledRejection", (reason: string, p: any) => {
  console.log("Error: ", reason)
})

const app = express();

app.set("port", process.env.PORT || 5000)
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(express.static("public"))

// Start server
app.listen(app.get("port"), () => {
  console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)
})
