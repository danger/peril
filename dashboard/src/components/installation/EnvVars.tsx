import * as React from "react"

import { createFragmentContainer, graphql, RelayProp } from "react-relay"
import { Button, Form, Message } from "semantic-ui-react"
import { EnvVars_installation } from "./__generated__/EnvVars_installation.graphql"
import { runEditEnvVarsMutation } from "./mutations/editEnvVarMutation"

interface Props {
  installation: EnvVars_installation
}

type RProps = Props & { relay: RelayProp }

interface State {
  loading: boolean
  error: boolean
  errorMessage?: string

  newVarKey?: string
  newVarValue?: string

  showKeys: string[]
}

class EnvVars extends React.Component<RProps, State> {
  constructor(props: RProps) {
    super(props)
    this.state = {
      loading: false,
      error: false,
      showKeys: [],
    }
  }

  public handleKeyChange = (_: any, { value }: any) => this.setState({ newVarKey: value })
  public handleValueChange = (_: any, { value }: any) => this.setState({ newVarValue: value })

  public submitNewKeyValueForm = (event: React.FormEvent) => {
    event.preventDefault()
    this.setState({ loading: true })
    this.submitKeyValueChanges({
      iID: this.props.installation.iID,
      key: this.state.newVarKey!,
      value: this.state.newVarValue,
    })
  }

  public submitKeyValueChanges = async (vars: { iID: number; key: string; value?: string }) => {
    try {
      await runEditEnvVarsMutation(this.props.relay.environment, vars, res => {
        const error = res.changeEnvVarForInstallation.error
        if (error) {
          this.setState({ loading: false, error: true, errorMessage: error.description })
        } else {
          document.location.reload()
        }
      })
    } catch (error) {
      console.error("Error setting the JSON URL:")
      console.error(error)
    }
  }

  public renderExistingEnvVars = () => (
    <table className="ui celled striped table" style={{ clear: "both" }}>
      <thead>
        <tr>
          <th colSpan={3}>Existing Env Vars</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(this.props.installation.envVars).map(key => (
          <tr key={key}>
            <td>
              <code>{key}</code>
            </td>
            <td className="collapsing aligned">
              <code style={{ overflowX: "scroll" }}>
                {this.state.showKeys.includes(key) ? this.props.installation.envVars[key] : "************"}
              </code>
            </td>
            <td className="collapsing aligned">
              {!this.state.showKeys.includes(key) && (
                <Button size="tiny" onClick={() => this.setState({ showKeys: [...this.state.showKeys, key] })}>
                  Show
                </Button>
              )}
              <Button size="tiny" onClick={() => this.submitKeyValueChanges({ iID: this.props.installation.iID, key })}>
                Remove
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  public render() {
    const envVars = Object.keys(this.props.installation.envVars)
    return (
      <div style={{ clear: "both" }}>
        <h3>Env Vars</h3>

        {envVars.length && this.renderExistingEnvVars()}

        <Form error={this.state.error} onSubmit={this.submitNewKeyValueForm} loading={this.state.loading}>
          {this.state.error && (
            <Message error header="Got an issue updating your installation" content={this.state.errorMessage!} />
          )}

          <p>Add a new env var to your installation</p>
          <Form.Group widths="equal">
            <Form.Input label="Key: " onChange={this.handleKeyChange} />
            <Form.Input label="Value: " onChange={this.handleValueChange} />
          </Form.Group>

          <Form.Button disabled={!this.state.newVarKey} floated="right">
            Submit
          </Form.Button>
        </Form>
      </div>
    )
  }
}

export default createFragmentContainer<RProps>(
  EnvVars,
  graphql`
    fragment EnvVars_installation on Installation {
      iID
      envVars
    }
  `
)
