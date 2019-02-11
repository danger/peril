// @ts-ignore
import * as lockFileGen from "@yarnpkg/lockfile"
// @ts-ignore
import * as dependencyTree from "dependency-tree"
// @ts-ignore
import * as detective from "detective-typescript"
// @ts-ignore

import * as semverSort from "semver-sort"

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

const getLockfileVersionForDep = (name: string) => {
  const references = lockDeps.filter(depName => depName.startsWith(name + "@"))
  if (!references.length) {
    throw new Error("No dep in lockfile found for " + name)
  }

  const semvers = references.map(ref => lockFileParsed.object[ref].version)
  return semverSort.desc(semvers)[0]
}

// Creates a 'dependencies' section for a package.json
const depsSection: any = {}

const extras = [
  "graphql-relay",
  "graphql-resolvers",
  "graphql-tools-types",
  "graphql-tools",
  "graphql",
  "node-mocks-http",
  "winston-papertrail",
]
extras.forEach(e => allDeps.push(e))

allDeps.sort().forEach(dep => {
  depsSection[dep] = getLockfileVersionForDep(dep)
})

// Cool beans
console.log("Updating the deps section:")
console.log(JSON.stringify(depsSection))

const existingPackageJSON = fs.readFileSync("../runner/package.json", "utf8")
const pkg = JSON.parse(existingPackageJSON)
pkg.dependencies = depsSection
fs.writeFileSync("../runner/package.json", JSON.stringify(pkg, null, "  "), "utf8")
