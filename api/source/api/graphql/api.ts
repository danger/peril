import { fetch } from "../../api/fetch"
import logger from "../../logger"

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
        throw new Error(`GraphQL API HTTP error\n> ${res.status} ${res.statusText} \n\nQuery:\n${query}}`)
      }
    })
    .then(body => {
      if (body.errors) {
        logger.info("Received errors from the GraphQL API")
        logger.info(body.errors)
      }
      return body
    })
    .catch(e => {
      logger.error("Error making an API call to the GraphQL API")
      logger.error(e)
    })
