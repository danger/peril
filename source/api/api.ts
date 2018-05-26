import { graphqlExpress } from "apollo-server-express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as cors from "cors"
import { Application } from "express"
import expressPlayground from "graphql-playground-middleware-express"

import { GITHUB_CLIENT_SECRET } from "../globals"
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

  // GQL
  // The main GraphQL route for Peril
  // TODO: Figure out authentication
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
