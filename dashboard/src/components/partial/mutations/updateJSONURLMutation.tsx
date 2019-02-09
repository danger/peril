import { commitMutation, graphql } from "react-relay"
import { Environment } from "relay-runtime"

export interface UpdateJSONURLMutationOptions {
  iID: number
  perilSettingsJSONURL: string
}

const mutation = graphql`
  mutation updateJSONURLMutation($iID: Int!, $perilSettingsJSONURL: String!) {
    convertPartialInstallation(iID: $iID, perilSettingsJSONURL: $perilSettingsJSONURL) {
      ... on Installation {
        perilSettingsJSONURL
      }
      ... on MutationError {
        error {
          description
        }
      }
    }
  }
`

export const updateJSONURLMutation = (
  environment: Environment,
  options: UpdateJSONURLMutationOptions,
  onCompleted: (res: any) => void
) =>
  commitMutation(environment, {
    mutation,
    variables: options,
    onError: err => {
      throw err
    },
    onCompleted,
  })
