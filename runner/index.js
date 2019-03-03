const path = require("path")
const perilRoot = path.join("..", "..", "opt", "out")

// Change our directory so that it's basically the layer
process.chdir(perilRoot)

// What the lambda calls
exports.handler = function(event, context, callback) {
  // Reach back to the main layer, and pull out Peril runtime export
  const app = require(path.join(perilRoot, "runner", "run"))
  callback(null, app.run(JSON.stringify(event)))
}
