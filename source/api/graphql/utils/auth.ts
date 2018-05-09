import { combineResolvers } from "graphql-resolvers"
import { GraphQLContext } from "../../api"

// A any'd resolver type, with the right context
export type Resolver = (obj: any, params: any, context: GraphQLContext) => Promise<any>

// A combined resolver that checks for auth before running the resolver
export const authD = (resolver: Resolver) => combineResolvers(isAuthenticated, resolver)

export const isAuthenticated = (_: any, __: any, context: GraphQLContext) => {
  if (!context.jwt) {
    return new Error("Not authenticated")
  }
  return undefined
}
