import * as React from "react"

import { createFragmentContainer, RelayProp } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { Form, Message } from "semantic-ui-react"
import { SetJSONPathForm_installation } from "./__generated__/SetJSONPathForm_installation.graphql"
import { updateJSONURLMutation } from "./mutations/updateJSONURLMutation"

interface Props {
  installation: SetJSONPathForm_installation
}

type RProps = Props & { relay: RelayProp }

interface State {
  loading: boolean
  error: boolean
  errorMessage?: string
  url: string
}

class SetJSONPathForm extends React.Component<RProps, State> {
  public state: State = { loading: false, url: "", error: false }

  public handleChange = (_: any, { value }: any) => this.setState({ url: value })
  public handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    this.setState({ loading: true })

    try {
      // Update the JSON
      await updateJSONURLMutation(
        this.props.relay.environment,
        {
          iID: this.props.installation.iID,
          perilSettingsJSONURL: this.state.url,
        },
        res => {
          const error = res.convertPartialInstallation.error
          if (error) {
            this.setState({ loading: false, error: true, errorMessage: error.description })
          } else {
            window.location.replace(`/installation/${this.props.installation.iID}`)
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
      <Form error={this.state.error} onSubmit={this.handleSubmit} loading={this.state.loading}>
        {this.state.error && (
          <Message error header="Issue with setting your JSON URL" content={this.state.errorMessage!} />
        )}
        <Form.Group inline>
          <Form.Input label="Set the JSON URL: " onChange={this.handleChange} />
          <Form.Button>Submit</Form.Button>
        </Form.Group>
      </Form>
    )
  }
}

export default createFragmentContainer<RProps>(
  SetJSONPathForm,
  {installation: graphql`
    fragment SetJSONPathForm_installation on Installation {
      iID
    }
  `}
)
