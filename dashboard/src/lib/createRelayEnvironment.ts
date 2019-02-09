import fetch from "isomorphic-unfetch"
import { Environment, Network, RecordSource, Store } from "relay-runtime"
import Cookies from "universal-cookie"

let relayEnvironment: Environment | null = null

// Define a function that returns the fetch for the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
export const fetchQuery = (operation: { text: string }, variables: any, _?: any, __?: any) => {
  const cookies = new Cookies()
  const auth = { Authorization: `Basic ${cookies.get("jwt")}` }

  return (
    fetch(`${process.env.REACT_APP_PUBLIC_API_ROOT_URL}/api/graphql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...auth,
      },
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        variables,
      }),
    })
      .then((response: any) => {
        return response.json()
      })
      // For debugging
      .then((json: any) => {
        return json
      })
  )
}

export default function initEnvironment() {
  // Create a network layer from the fetch function
  const network = Network.create(fetchQuery)
  const store = new Store(new RecordSource({}))

  // reuse Relay environment on client-side
  if (!relayEnvironment) {
    relayEnvironment = new Environment({
      network,
      store,
    })
  }

  return relayEnvironment
}
