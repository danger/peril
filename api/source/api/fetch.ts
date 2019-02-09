import * as node_fetch from "node-fetch"

export function fetch(url: string | node_fetch.Request, init?: node_fetch.RequestInit): Promise<node_fetch.Response> {
  const isTests = typeof jest !== "undefined"
  if (isTests) {
    const message = `No API calls in tests please: ${url}`
    debugger // tslint:disable-line
    throw new Error(message)
  }

  if (process.env.LOG_FETCH_REQUESTS && init) {
    const output = ["curl", "-i"]
    if (init.method) {
      output.push(`-X ${init.method}`)
    }
    if (init.headers) {
      for (const prop in init.headers) {
        if (init.headers.hasOwnProperty(prop)) {
          // @ts-ignore
          output.push("-H", `"${prop}: ${init.headers[prop]}"`)
        }
      }
    }

    if (init.method === "POST" && init.body) {
      const body = init.body.toString()
      output.concat(["-H", "Content-Type: application/json"])
      output.concat(["--data-binary", body])
    }

    if (typeof url === "string") {
      output.push(url)
    }

    console.log(output.join(" ")) // tslint:disable-line

    console.log(init) // tslint:disable-line
  }

  const originalFetch: any = node_fetch
  return originalFetch(url, init)
}

export default fetch
