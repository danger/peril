import { graphqlExpress } from "apollo-server-express"
import * as bodyParser from "body-parser"
import { Application } from "express"

import { generateAuthToken, redirectForGHOauth } from "./auth/generate"
import { schema } from "./graphql"
import prDSLRunner from "./pr/dsl"

// Public API
const setupPublicAPI = (app: Application) => {
  // MISC
  // Generate a JSON DSL for any random PR
  app.get("/api/v1/pr/dsl", prDSLRunner)

  // AUTH
  // Start generating a Peril JWT for admin
  app.get("/api/auth/peril/start", redirectForGHOauth)
  // Actually generate a Peril JWT for admin after GH Oauth
  app.get("/api/auth/peril/github_end", generateAuthToken)

  // GQL
  // The main GraphQL route for Peril
  // TODO: Figure out authentication
  app.use("/api/graphql", bodyParser.json(), graphqlExpress({ schema })) // won't work yet
}

export default setupPublicAPI
