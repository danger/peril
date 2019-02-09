const {
  rewireWebpack: rewireTypescript,
  rewireJest: rewireTypescriptJest,
} = require("react-app-rewire-typescript-babel-preset")
const { injectBabelPlugin } = require("react-app-rewired")

module.exports = {
  webpack: function(config, env) {
    let webpack = rewireTypescript(config)
    webpack = injectBabelPlugin("relay", webpack)
    return webpack
  },
  jest: function(config) {
    let jest = rewireTypescriptJest(config)
    jest = injectBabelPlugin("relay", webpack)
    return jest
  },
}
