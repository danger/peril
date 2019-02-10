exports.handler = function(event, context, callback) {
  const perilRoot = "../../opt/out/"

  // Reach back to the main layer, and pull out Peril runtime export
  const app = require(perilRoot + "runner/run")

  callback(null, app.run(JSON.stringify(event)))
}
