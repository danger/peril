import { combineResolvers } from "graphql-resolvers"
import { makeExecutableSchema } from "graphql-tools"
import { JSON } from "graphql-tools-types"

import { getDB } from "../../db/getDB"
import { MongoDB } from "../../db/mongo"
import { GraphQLContext } from "../api"
import { getDetailsFromPerilJWT } from "../auth/generate"

// This is a template string function, which returns the original string
// It's based on https://github.com/lleaff/tagged-template-noop
// Which is MIT licensed to lleaff
//

const gql = (strings: any, ...keys: any[]) => {
  const lastIndex = strings.length - 1
  return strings.slice(0, lastIndex).reduce((p: any, s: any, i: number) => p + s + keys[i], "") + strings[lastIndex]
}

const typeDefs = gql`
  # Basically a way to say this is going to be untyped data (it's normally user input)
  scalar JSON

  # An installation of Peril, ideally not too tightly tied to GH
  type Installation {
    # The MongoDB ID
    id: String!
    # The installation ID, in the real sense
    iID: Int!
    # The path to the Dangerfile
    perilSettingsJSONURL: String!
    # The name of a user/org which the installation is attached to
    login: String!
    # A set of per repo rules
    repos: JSON!
    # Rules that are for all repos
    rules: JSON!
    # Scheduled tasks to run repeatedly
    scheduler: JSON!
    # Installation settings, for example ignored repos
    settings: JSON!
    # Tasks which you can schedule to run in the future
    tasks: JSON!
  }

  # Someone logged in to the API, all user data is stored inside the JWT
  type User {
    # Display name
    name: String!
    # Use this to show an avatar
    avatarURL: String!

    # The installations that a user can access, TODO
    # move to be a connection
    installations: [Installation]!
  }

  # Root
  type Query {
    me: User
  }

  type Mutation {
    # Building this out incrementally, but basically this provides
    # the ability to set the URL that Peril should grab data from
    editInstallation(iID: Int!, perilSettingsJSONURL: String!): Installation
  }
`

const isAuthenticated = (_: any, __: any, context: GraphQLContext) => {
  if (!context.jwt) {
    return new Error("Not authenticated")
  }
  return undefined
}

const resolvers = {
  JSON: JSON({ name: "Any" }),

  User: {
    installations: combineResolvers(isAuthenticated, async (_: any, __: any, context: GraphQLContext) => {
      const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
      const db = getDB() as MongoDB
      return await db.getInstallations(decodedJWT.iss.map(i => parseInt(i, 10)))
    }),
    // Rename it from GH's JSON to camelCase
    avatarURL: ({ avatar_url }: { avatar_url: string }) => avatar_url,
  },

  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.jwt) {
        return new Error("Not authenticated")
      }
      const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
      return decodedJWT.data.user
    },
  },

  Mutation: {
    editInstallation: async (_: any, params: any, context: GraphQLContext) => {
      const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
      const installationID = String(params.iID)

      if (!decodedJWT.iss.includes(installationID)) {
        throw new Error(`You don't have access to this installation`)
      }

      // This is definitely overkil, but sure
      const db = getDB() as MongoDB
      const updatedInstallation = await db.saveInstallation(params)
      await db.updateInstallation(updatedInstallation.iID)
      return updatedInstallation
    },
  },
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
