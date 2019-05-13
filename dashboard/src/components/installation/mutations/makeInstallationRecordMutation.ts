import { commitMutation } from "react-relay"
import { Environment } from "relay-runtime"
import graphql from 'babel-plugin-relay/macro';


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
