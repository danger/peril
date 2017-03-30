import * as fs from "fs"
import * as glob from "glob"
import * as tsToJSON from "json2ts"

glob("source/github/events/__tests__/fixtures/*.json", (error, files: string[]) => {
  files.forEach((file) => {
    const contents = fs.readFileSync(file).toString()
    const types = tsToJSON.convert(contents)
    const newFileName = file.replace(".json", ".types.ts").replace("__tests__/fixtures", "types")
    fs.writeFileSync(newFileName, types)
  })
})
