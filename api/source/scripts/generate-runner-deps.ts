// @ts-ignore
import * as lockFileGen from "@yarnpkg/lockfile"
// @ts-ignore
import * as dependencyTree from "dependency-tree"
// @ts-ignore
import * as detective from "detective-typescript"

import * as fs from "fs"
import * as path from "path"

// Starting at the runner, generate a list of all the
// files inside the Peril repo which are referenced by the runner
const tree = dependencyTree.toList({
  filename: path.resolve(__dirname, "..", "runner", "index.ts"),
  directory: path.resolve(__dirname, "..", ".."),
})

const filterDefTypes = (fpath: string) => !fpath.endsWith("d.ts")
const onlyModules = (fpath: string) => !fpath.startsWith(".")

// Filter that list down to just source-files
const perilModules = tree.filter(filterDefTypes)

// Now we pull out every node module reference in
// all of the in-app dependencies
let allDeps: string[] = []

// Hide some of the extra stuff
const builtIn = ["fs", "path", "util", "child_process", "http"]
const filterNodeModules = (nodes: string) => !builtIn.includes(nodes)

// Converts an import reference to the real dependency name
// basically to undo any imports which aren't the root import
const moduleName = (importPath: string) => {
  const allowedSlashes = importPath.startsWith("@") ? 1 : 0
  if (!allowedSlashes) {
    return importPath.split("/")[0]
  } else {
    return importPath.split("/")[0] + "/" + importPath.split("/")[1]
  }
}

perilModules.forEach(moduleFile => {
  const content = fs.readFileSync(moduleFile, "utf8")
  const deps = detective(content).filter(onlyModules)
  allDeps = [...allDeps, ...deps.filter(filterNodeModules).map(moduleName)]
})

// Now we've got a list of the modules
// we need to get the exact lockfile version
// for consistency
const file = fs.readFileSync("yarn.lock", "utf8")
const lockFileParsed = lockFileGen.parse(file)
const lockDeps = Object.keys(lockFileParsed.object)

const getLockfileRefForDep = (name: string) => {
  const reference = lockDeps.find(depName => depName.startsWith(name + "@"))
  if (!reference) {
    throw new Error("No dep in lockfile found for " + name)
  }
  return lockFileParsed.object[reference]
}

// Creates a 'dependencies' section for a package.json
const depsSection: any = {}

allDeps.forEach(dep => {
  const ref = getLockfileRefForDep(dep)
  depsSection[dep] = ref.version
})

const specialCases = {
  "winston-papertrail": getLockfileRefForDep("winston-papertrail").version,
}

const newDependencies = {
  ...depsSection,
  ...specialCases,
}

// Cool beans
console.log("Updating the deps section:")
console.log(JSON.stringify(newDependencies))

const existingPackageJSON = fs.readFileSync("../runner/package.json", "utf8")
const pkg = JSON.parse(existingPackageJSON)
pkg.dependencies = newDependencies
fs.writeFileSync("../runner/package.json", JSON.stringify(pkg, null, "  "), "utf8")
