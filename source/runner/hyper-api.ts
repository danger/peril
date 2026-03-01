import * as aws4 from "hyper-aws4"
import fetch from "node-fetch"
import { HYPER_ACCESS_KEY, HYPER_FUNC_NAME, HYPER_SECRET_KEY } from "../globals"
import logger from "../logger"

// For usage, check out these tests, https://github.com/Tim-Zhang/hyper-aws4/blob/master/test/unit.js

let funcUUID: string | null = null

// TEMPORARY workaround
// See: https://forum.hyper.sh/t/ssl-error-in-hyper-func-api-endpoints-via-https/873
const hyperFuncHost = "https://us-west-1.hyperfunc.io"
const hyperHost = "https://us-west-1.hyper.sh/"

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/index.html

// Path is either an absolute URL, or relative to the hyper API
export const hyper = (path: string, method: "GET" | "PUT" | "POST" | "DELETE", body?: any) => {
  const signOption: any = {
    url: path.startsWith("http") ? path : hyperHost + path,
    method,
    credential: {
      accessKey: HYPER_ACCESS_KEY,
      secretKey: HYPER_SECRET_KEY,
    },
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  if (body) {
    signOption.body = JSON.stringify(body)
  }

  const headers = aws4.sign(signOption)
  const options: any = { method: signOption.method, headers }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return fetch(signOption.url, options).then(res => {
    if (res.ok) {
      if (res.headers.get("Content-Type") === "application/json") {
        return res.json()
      } else {
        return res.text()
      }
    } else {
      return res.text().then(err => {
        logger.error("HTTP Error from Hyper:", err)
        throw err
      })
    }
  })
}

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Image/create.html
export const updateHyperFuncImageUpdate = (name: string) => hyper(`images/create?fromImage=${name}`, "POST")

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Image/list.html
export const getAllHyperImages = () => hyper("/images/json?all=0", "GET")

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Image/remove.html
export const deleteHyperImage = (name: string) => hyper(`/images/${name}`, "DELETE")

// https://docs.hyper.sh/hyper/Reference/API/2016-04-04%20[Ver.%201.23]/Func/get.html
// GET https://$region.hyperfunc.io/output/$name/$uuid/$call_id[/wait]
// Note: different API host:
export const getHyperLogs = (callID: string) =>
  hyper(`${hyperFuncHost}/output/${HYPER_FUNC_NAME}/${funcUUID}/${callID}/wait`, "GET")

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/call.html
export const callHyperFunction = async (body: any) => {
  // Use the API to grab the UUID needed for the hyper call
  if (!funcUUID) {
    const funcInfo = await getHyperFuncInfo()
    funcUUID = funcInfo.UUID
  }

  // Note: different API host:
  return hyper(hyperFuncHost + `/call/${HYPER_FUNC_NAME}/${funcUUID}`, "POST", body)
}

interface FuncInfo {
  Name: string
  ContainerSize: string
  Timeout: number
  UUID: string
  Created: string
}

// https://docs.hyper.sh/Reference/API/2016-04-04%20%5BVer.%201.23%5D/Func/inspect.html
export const getHyperFuncInfo = () => hyper(`funcs/${HYPER_FUNC_NAME}`, "GET") as Promise<FuncInfo>

// In case you want to iterate faster
// ;(function() {
//   callHyperFunction({})
// })()
