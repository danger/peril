const path = require("path")
const perilRoot = path.join("..", "..", "opt", "out")

// Ensures that node modules coming in from Peril work
require("./app-module-path").addPath(perilRoot)

// What the lambda calls
exports.handler = function(event, context, callback) {
  // Reach back to the main layer, and pull out Peril runtime export
  const app = require(perilRoot + "runner/run")

  callback(null, app.run(JSON.stringify(event)))
}
