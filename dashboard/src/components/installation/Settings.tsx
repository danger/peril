import * as React from "react"

import { createFragmentContainer, RelayProp } from "react-relay"
import graphql from "babel-plugin-relay/macro"

import { Form, Message } from "semantic-ui-react"
import { Settings_installation } from "./__generated__/Settings_installation.graphql"
import { editInstallationMutation } from "./mutations/editInstallationMutation"

interface Props {
  installation: Settings_installation
}

type RProps = Props & { relay: RelayProp }

interface State {
  url: string
  loading: boolean
  error: boolean
  errorMessage?: string

  perilSettingsJSONURL?: string
  installationSlackUpdateWebhookURL?: string
}

class Settings extends React.Component<RProps, State> {
  constructor(props: RProps) {
    super(props)

    this.state = {
      loading: false,
      url: "",
      error: false,
      installationSlackUpdateWebhookURL: props.installation.installationSlackUpdateWebhookURL || undefined,
      perilSettingsJSONURL: props.installation.perilSettingsJSONURL || undefined,
    }
  }

  public handleSlackChange = (_: any, { value }: any) => this.setState({ installationSlackUpdateWebhookURL: value })
  public handleSettingsChange = (_: any, { value }: any) => this.setState({ perilSettingsJSONURL: value })

  public handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    this.setState({ loading: true })

    try {
      await editInstallationMutation(
        this.props.relay.environment,
        {
          iID: this.props.installation.iID,
          perilSettingsJSONURL: this.state.perilSettingsJSONURL,
          installationSlackUpdateWebhookURL: this.state.installationSlackUpdateWebhookURL,
        },
        res => {
          const error = res.editInstallation.error
          if (error) {
            this.setState({ loading: false, error: true, errorMessage: error.description })
          } else {
            this.setState({ loading: false })
          }
        }
      )
    } catch (error) {
      console.error("Error setting the JSON URL:")
      console.error(error)
    }
  }

  public render() {
    return (
      <div>
        <h3>Settings for your installation</h3>
        <Form error={this.state.error} onSubmit={this.handleSubmit} loading={this.state.loading}>
          {this.state.error && (
            <Message error header="Got an issue updating your installation" content={this.state.errorMessage!} />
          )}

          <Form.Group widths="equal">
            <Form.Input
              label="Slack Incoming Webhook URL: "
              value={this.state.installationSlackUpdateWebhookURL}
              onChange={this.handleSlackChange}
            />
            <Form.Input
              label="Your Settings JSON URL: "
              value={this.state.perilSettingsJSONURL}
              onChange={this.handleSettingsChange}
            />
          </Form.Group>

          <Form.Button floated="right">Submit</Form.Button>
        </Form>
      </div>
    )
  }
}

export default createFragmentContainer<RProps>(Settings, {
  installation: graphql`
    fragment Settings_installation on Installation {
      iID
      installationSlackUpdateWebhookURL
      perilSettingsJSONURL
    }
  `,
})
