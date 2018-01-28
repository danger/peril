import { HYPER_ACCESS_KEY, HYPER_FUNC_NAME, HYPER_SECRET_KEY } from "globals"
import * as aws4 from "hyper-aws4"
import fetch from "node-fetch"

// For usage, check out these tests, https://github.com/Tim-Zhang/hyper-aws4/blob/master/test/unit.js

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
  return fetch(signOption.url).then(res => res.json())
}

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/update.html
export const callHyperFuncUpdate = () => hyper(`func/${HYPER_FUNC_NAME}`, "PUT")

// https://docs.hyper.sh/Reference/API/2016-04-04%20[Ver.%201.23]/Func/call.html
export const callHyperFunction = (uuid: string, body: any) =>
  hyper(`func/call/${HYPER_FUNC_NAME}/${uuid}`, "POST", body)
