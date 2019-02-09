declare module "express-x-hub"
declare module "hyper-aws4"
declare module "uuid/v1"
declare module "json2ts"

declare module "async-exit-hook"
declare module "graphql-resolvers"

// TODO: Make types for these two?
declare module "graphql-tools-types"
declare module "winston"

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

  /** Returns the Node interface that GraphQL types can implement */
  function nodeInterface(): any
  /** Returns the node root field to include on the Query type */
  function nodeField(): any
  /** returns the nodes root field to include on the Query type */
  function nodesField(): any

  type GetNode = (id: string) => any
  /** Returns the node and nodes root field resolver to include on the query type. To implement this,
   * it takes a function to resolve an ID to an object.
   */
  function nodeDefinitions(get: GetNode): any
  /** Takes a type name and an ID specific to that type name, and returns a "global ID" that is unique among all types. */
  function toGlobalId(): any
  /** Takes the "global ID" created by toGlobalID, and returns the type name and ID used to create it. */
  function fromGlobalId(id: string): any
  /** Creates the resolver for an id field on a node. */
  function globalIdResolver(): any
}

// shame, https://github.com/primus/primus/pull/623
declare module "primus"

// Basically does one thing
declare module "override-require"
