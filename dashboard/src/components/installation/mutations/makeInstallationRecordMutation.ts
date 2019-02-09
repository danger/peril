import { commitMutation, graphql } from "react-relay"
import { Environment } from "relay-runtime"

const mutation = graphql`
  mutation makeInstallationRecordMutation($iID: Int!) {
    makeInstallationRecord(iID: $iID) {
      ... on Installation {
        login
      }
      ... on MutationError {
        error {
          description
        }
      }
    }
  }
`

export const runRecordWebhooksMutation = (environment: Environment, installationID: number) => {
  const variables = {
    iID: installationID,
  }
  console.log(variables)
  commitMutation(environment, {
    mutation,
    variables,
    onError: err => console.error(err),
  })
}
