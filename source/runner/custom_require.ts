import transpiler from "danger/distribution/runner/runners/utils/transpiler"
import * as debug from "debug"
import { readFileSync } from "fs"

const d = debug("peril:transpiler")

export const customModuleHandler = (module: any, filename: string) => {
  debugger

  if (!filename.includes("node_modules")) {
    d("Handling custom module: ", filename)
  }
  const contents = readFileSync(filename, "utf8")
  const compiled = transpiler(contents, filename)
  module._compile(compiled, filename)
}
