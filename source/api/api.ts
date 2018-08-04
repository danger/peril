import { graphqlExpress } from "apollo-server-express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as cors from "cors"
import { Request, Response } from "express"
import { Application } from "express"
import expressPlayground from "graphql-playground-middleware-express"

import { GITHUB_CLIENT_SECRET } from "../globals"
import { primus } from "../listen"
import logger from "../logger"
import { getDetailsFromPerilJWT } from "./auth/generate"
import { getJWTFromRequest } from "./auth/getJWTFromRequest"
import { fakeAuthToken, generateAuthToken, redirectForGHOauth } from "./auth/github"
import { schema } from "./graphql"
import { redirectForGHInstallation } from "./integration/github"
import { prDSLRunner } from "./pr/dsl"

export const GitHubOAuthStart = "/api/auth/peril/github/start"
export const GitHubOAuthEnd = "/api/auth/peril/github/end"

export interface GraphQLContext {
  jwt: string
}

// Public API
export const setupPublicAPI = (app: Application) => {
  // MISC
  // Generate a JSON DSL for any random PR
  app.get("/api/v1/pr/dsl", prDSLRunner)

  // So the JWT can be stored / set
  app.use(cookieParser(GITHUB_CLIENT_SECRET))

  // INTEGRATION
  // So that someone can install Peril on their org
  app.get("/api/integrate/github", redirectForGHInstallation)

  // AUTH
  // Start generating a Peril JWT for admin
  app.get(GitHubOAuthStart, redirectForGHOauth)
  // Actually generate a Peril JWT for admin after GH Oauth
  app.get(GitHubOAuthEnd, generateAuthToken)
  // A useful for testing locally cookie generator
  app.get("/api/auth/peril/github/fake", fakeAuthToken)

  // SCRIPT
  // Sets up the primus library client side
  app.get("/scripts/primus.js", (_, res: Response) => {
    res.send(primus.library())
  })

  // GQL
  // The main GraphQL route for Peril
  app.use(
    "/api/graphql",
    cors(),
    bodyParser.json(),
    graphqlExpress(req => ({
      schema,
      context: {
        jwt: getJWTFromRequest(req),
      },
      tracing: true,
      cacheControl: true,
    }))
  )

  app.get(
    "/api/graphiql",
    expressPlayground({
      endpoint: "/api/graphql",
      workspaceName: "Peril",
      settings: {
        "request.credentials": "include", // https://github.com/graphcool/graphql-playground/pull/661
      } as any,
    })
  )
}

export const setupPublicWebsocket = () => {
  // Handle verifying things which we connect
  primus.authorize(async (req: Request, done: any) => {
    const jwt = getJWTFromRequest(req)
    if (!jwt) {
      return done(new Error("No auth"))
    }

    const details = await getDetailsFromPerilJWT(jwt)

    if (!req.query) {
      return done(new Error("No query included"))
    }

    if (!req.query.iID) {
      return done(new Error("No query iID included"))
    }

    if (!details.iss.includes(req.query.iID.toString())) {
      return done(new Error("The query iID is not in the JWT"))
    }

    done()
  })

  primus.on("connection", (spark: any) => {
    spark.write({ connected: true, action: "connected" })
  })

  primus.on("disconnection", (spark: any) => {
    // the spark that disconnected
    spark.write({ connected: false, action: "connected" })
  })
}

export interface MSGDangerfileStarted {
  event: string
  action: "started"

  filenames: string[]
}

export interface MSGDangerfileFinished {
  event: string
  action: "finished"

  filenames: string[]
  time: number
}

export interface MSGDangerfileLog {
  event: string
  action: "log"

  filenames: string[]
  log: string
}

type MSGMessages = MSGDangerfileStarted | MSGDangerfileFinished | MSGDangerfileLog

export const sendMessageToConnectionsWithAccessToInstallation = (iID: number, message: MSGMessages) => {
  if (!primus) {
    return
  }

  primus.forEach((spark: any) => {
    if (spark.query.iID === iID.toString()) {
      spark.write(message)
    }
  })
}

export const sendAsyncMessageToConnectionsWithAccessToInstallation = (
  iID: number,
  callback: (spark: any) => Promise<any>
) => {
  if (!primus) {
    return
  }

  primus.forEach(
    (spark: any, finalCallback: any) => {
      if (spark.query.iID === iID.toString()) {
        callback(spark).then(finalCallback)
      } else {
        finalCallback()
      }
    },
    (err: Error) => {
      if (err) {
        logger.error("Got an error messaging in sendAsyncMessageToConnectionsWithAccessToInstallation:")
        logger.error(JSON.stringify(err, null, "  "))
      }
    }
  )
}
