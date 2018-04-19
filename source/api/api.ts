import { graphqlExpress } from "apollo-server-express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import { Application } from "express"

import { GITHUB_CLIENT_SECRET } from "../globals"
import { generateAuthToken, redirectForGHOauth } from "./auth/generate"
import { schema } from "./graphql"
import prDSLRunner from "./pr/dsl"

export const GitHubOAuthStart = "/api/auth/peril/start"
export const GitHubOAuthEnd = "/api/auth/peril/github_end"

// Public API
const setupPublicAPI = (app: Application) => {
  // MISC
  // Generate a JSON DSL for any random PR
  app.get("/api/v1/pr/dsl", prDSLRunner)

  // So the JWT can be stored / set
  app.use(cookieParser(GITHUB_CLIENT_SECRET))

  // AUTH
  // Start generating a Peril JWT for admin
  app.get(GitHubOAuthStart, redirectForGHOauth)
  // Actually generate a Peril JWT for admin after GH Oauth
  app.get(GitHubOAuthEnd, generateAuthToken)

  // GQL
  // The main GraphQL route for Peril
  // TODO: Figure out authentication
  app.use("/api/graphql", bodyParser.json(), graphqlExpress({ schema })) // won't work yet
}

export default setupPublicAPI
