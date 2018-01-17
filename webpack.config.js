var path = require("path")

module.exports = {
  entry: "./source/peril-runner.ts",
  target: "node",
  module: {
    loaders: [{ test: /\.ts(x?)$/, loader: "ts-loader" }],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname),
    filename: "peril-runner-dist.js",
  },
}
