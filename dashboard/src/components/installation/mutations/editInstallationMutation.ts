import { commitMutation } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { Environment } from "relay-runtime"

export interface EditInstallationMutationOptions {
  iID: number
  perilSettingsJSONURL?: string
  installationSlackUpdateWebhookURL?: string
}

const mutation = graphql`
  mutation editInstallationMutationMutation(
    $iID: Int!
    $perilSettingsJSONURL: String
    $installationSlackUpdateWebhookURL: String
  ) {
    editInstallation(
      iID: $iID
      perilSettingsJSONURL: $perilSettingsJSONURL
      installationSlackUpdateWebhookURL: $installationSlackUpdateWebhookURL
    ) {
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

export const editInstallationMutation = (
  environment: Environment,
  options: EditInstallationMutationOptions,
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
