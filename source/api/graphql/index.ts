import { combineResolvers } from "graphql-resolvers"
import { makeExecutableSchema } from "graphql-tools"

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
  type Installation {
    # The MongoDB ID
    id: String!
    # The installation ID, in the real sense
    iID: Int!
    # The path to the Dangerfile
    perilSettingsJSONURL: String!
    # The name of a user/org which the installation is attached to
    login: String!
  }

  type User {
    name: String!
    avatarURL: String!

    installations: [Installation]!
  }

  # Root
  type Query {
    me: User
  }

  type Mutation {
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
