import { fetch } from "../../api/fetch"

export const graphqlAPI = (url: string, query: string) =>
  fetch(`${url}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  })
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        throw new Error("GraphQL API HTTP error\n> " + res.statusText + "\n")
      }
    })
    .then(body => {
      if (body.errors) {
        // tslint:disable-next-line:no-console
        console.log("Received errors from the GraphQL API")
        // tslint:disable-next-line:no-console
        console.log(body.errors)
      }
      return body
    })
