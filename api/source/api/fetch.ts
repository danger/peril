import * as AsyncRetry from "async-retry"
import * as node_fetch from "node-fetch"

const shouldRetryRequest = (res: node_fetch.Response) => {
  // Don't retry 4xx errors other than 401. All 4xx errors can probably be ignored once
  // the Github API issue causing https://github.com/danger/peril/issues/440 is fixed
  return res.status === 401 || (res.status >= 500 && res.status <= 599)
}

export async function retryableFetch(
  url: string | node_fetch.Request,
  init?: node_fetch.RequestInit
): Promise<node_fetch.Response> {
  const retries = 3
  return AsyncRetry(
    async (_, attempt) => {
      const originalFetch = node_fetch.default
      const res = await originalFetch(url, init)

      // Throwing an error will trigger a retry
      if (attempt <= retries && shouldRetryRequest(res)) {
        throw new Error(`Request failed [${res.status}]: ${res.url}. Attempting retry ${attempt} of ${retries}.`)
      }

      return res
    },
    {
      retries,
      onRetry: (error) => {
        console.log(error.message) // tslint:disable-line
      },
    }
  )
}

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

  return retryableFetch(url, init)
}

export default fetch
