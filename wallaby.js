module.exports = wallaby => {
  const babel = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, ".babelrc")))
  babel.presets.push("babel-preset-jest")

  return {
    files: [
      "tsconfig.json",
      ".env",
      ".env.sample",
      ".babelrc",
      { pattern: "source/**/fixtures/**/*.*", instrument: false },
      "source/**/!(*.test).ts",
      { pattern: "package.json", instrument: false },
      { pattern: "source/runner/runners/_tests/vm2.test.ts", instrument: true, load: false, ignore: false },
      { pattern: "source/api/_tests/fetch.test.ts", instrument: true, load: false, ignore: false },
    ],
    setup: function() {
      wallaby.testFramework.configure(require("./package.json").jest)
      require("dotenv").config({ path: __dirname })
    },

    tests: ["source/**/*.test.ts"],

    env: {
      type: "node",
      runner: "node",
    },

    // fixtures are not instrumented, but still need to be compiled
    // preprocessors: {
    //   // "source/**/fixtures/**/*.js?(x)": file => require("babel-core").transform(file.content, babel),
    // },
    // https://wallabyjs.com/docs/integration/node.html
    testFramework: "jest",
  }
}
