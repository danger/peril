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

  }

  type User {
    name: String
    installations: [Installation]
  }

  # the schema allows the following query:
  type Query {
    me: User
  }
`

const resolvers = {
  User: {
    installations: () => ({}),
  },
  Query: {
    me: () => ({}),
  },
}

import { makeExecutableSchema } from "graphql-tools"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
