declare module "express-x-hub"
declare module "hyper-aws4"
declare module "uuid"
declare module "json2ts"

declare module "async-exit-hook"
declare module "graphql-resolvers"

// TODO: Make types for these two
declare module "graphql-tools-types"

// https://github.com/excitement-engineer/graphql-relay-tools
declare module "graphql-relay-tools" {
  interface ConnectionArgs {
    after: string
    before: string
    first: number
    last: number
  }

  interface ConnectionMeta {
    arrayLength: number
    sliceStart: number
  }

  interface ConnectionDefinition {
    name: string
    nodeType?: string
    edgeFields?: string
    connectionFields?: string
  }

  function connectionFromArray(data: any[], args: ConnectionArgs): any
  function connectionFromPromisedArray(dataPromise: Promise<any[]>, args: ConnectionArgs): any
  function connectionFromArraySlice(data: any[], args: ConnectionArgs, meta: ConnectionMeta): any
  function connectionFromPromisedArraySlice(dataPromise: Promise<any[]>, args: ConnectionArgs): any

  function connectionArgs(): string
  function connectionDefinitions(definition: ConnectionDefinition): any
  function pageInfoType(): string
}
