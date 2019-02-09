import { commitMutation, graphql } from "react-relay"
import { Environment } from "relay-runtime"

const mutation = graphql`
  mutation editEnvVarMutation($iID: Int!, $key: String!, $value: String) {
    changeEnvVarForInstallation(iID: $iID, key: $key, value: $value)
  }
`

export const runEditEnvVarsMutation = (
  environment: Environment,
  variables: {
    iID: number
    key: string
    value?: string
  },
  onCompleted: (res: any) => void
) => {
  commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError: err => console.error(err),
  })
}
