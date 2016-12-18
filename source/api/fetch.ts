import * as node_fetch from "node-fetch" 
import {LOG_FETCH_REQUESTS} from "../globals"

export default function fetch(url: string | node_fetch.Request, init?: node_fetch.RequestInit): Promise<node_fetch.Response> {

  if (LOG_FETCH_REQUESTS) {
    const output = ["curl", "-i"]
    if (init.method) {
      output.push(`-X ${init.method}`)
    }
    if (init.headers) {
      for (const prop in init.headers) {
          if (init.headers.hasOwnProperty(prop)) {
            output.push("-H", `"${prop}: ${ init.headers[prop]}"`)
          }
      }
    }

    if (init.method === "POST") {
      // const body:string = init.body
      // output.concat([init.body])
    }

    if (typeof url === 'string') {
      output.push(url)
    }
    
    console.log(output.join(" "))
  }
  
  const originalFetch:any = node_fetch
  return originalFetch(url, init)
}
