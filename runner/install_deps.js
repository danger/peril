const { readFileSync, existsSync } = require("fs")

let package = ""
try {
  package = JSON.parse(readFileSync("../package.json", "utf8"))
} catch (error) {
  package = JSON.parse(readFileSync("./original-package.json", "utf8"))
}

const depsToInstall = package.availablePerilRuntimeDependencies
const command = Object.keys(depsToInstall)
  .map(key => `${key}@${depsToInstall[key]}`)
  .join(" ")

const execSync = require("child_process").execSync
process.exitCode = execSync("yarn add " + command)
