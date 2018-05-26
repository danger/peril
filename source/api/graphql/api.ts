import { fetch } from "../../api/fetch"

export const graphqlAPI = (url: string, query: string) =>
  fetch(`${url}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({ query }),
  })
    .then(res => {
      return res.json()
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
