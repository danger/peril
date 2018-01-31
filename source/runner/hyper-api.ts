import * as aws4 from "hyper-aws4"
import fetch from "node-fetch"
import { HYPER_ACCESS_KEY, HYPER_FUNC_NAME, HYPER_SECRET_KEY } from "../globals"
import logger from "../logger"

// For usage, check out these tests, https://github.com/Tim-Zhang/hyper-aws4/blob/master/test/unit.js

let funcUUID: string | null = null

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/index.html

export const hyper = (path: string, method: "GET" | "PUT" | "POST", body?: any) => {
  const signOption: any = {
    url: "https://us-west-1.hyper.sh/" + path,
    method,
    credential: {
      accessKey: HYPER_ACCESS_KEY,
      secretKey: HYPER_SECRET_KEY,
    },
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
      return res.json()
    } else {
      return res.text().then(err => {
        logger.error(err)
        throw err
      })
    }
  })
}

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/update.html
export const callHyperFuncUpdate = () => hyper(`func/${HYPER_FUNC_NAME}`, "PUT")

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/call.html
export const callHyperFunction = async (body: any) => {
  // Use the API to grab the UUID needed for the hyper call
  if (!funcUUID) {
    const deets = await getHyperFuncInfo()
    logger.info("d", deets)
    funcUUID = deets.UUID
  }

  return hyper(`func/call/${HYPER_FUNC_NAME}/${funcUUID}`, "POST", body)
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
