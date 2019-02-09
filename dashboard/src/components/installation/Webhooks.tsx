import * as React from "react"

import { createFragmentContainer, graphql, RelayProp } from "react-relay"
import { Button, Table } from "semantic-ui-react"
import { fetchQuery } from "../../lib/createRelayEnvironment"
import { Webhooks_installation } from "./__generated__/Webhooks_installation.graphql"
import { triggerWebhookMutation } from "./mutations/triggerWebhookMutation"
import WebhooksHeader from "./WebhooksHeader"

interface Props {
  installation: Webhooks_installation
}

interface State {
  eventJSONs: any
}

type RProps = Props & { relay: RelayProp }

class Webhooks extends React.Component<RProps, State> {
  public state = { eventJSONs: {} as any }

  /** Triggers re-sending a webhook */
  public sendWebhook = (env: any, iID: number, eventID: string) => (e: any, _: any) => {
    e.preventDefault()
    triggerWebhookMutation(env, iID, eventID)
  }

  /** Grabs the json for a webhook */
  public getWebhook = (iID: number, eventID: string) => async (e: any, _: any) => {
    e.preventDefault()
    const request = await fetchQuery(
      {
        text: `
    query getWebhook($iID: Int!, $eventID: String!) {
      webhook(iID: $iID, eventID: $eventID) {
        eventID
        json
      }
    }
    `,
      },
      { iID, eventID }
    )
    const newEventJSON = this.state.eventJSONs
    newEventJSON[request.data.webhook.eventID] = request.data.webhook.json
    this.setState({ eventJSONs: newEventJSON })
  }

  public render() {
    const props = this.props
    if (!props.installation.webhooks || props.installation.webhooks.edges!.length === 0) {
      return <WebhooksHeader installation={props.installation} />
    }

    const webhooks = props.installation.webhooks!.edges!

    return (
      <div>
        <WebhooksHeader installation={props.installation} />
        <Table attached="bottom">
          <Table.Header>
            <Table.HeaderCell key="event">Event</Table.HeaderCell>
            <Table.HeaderCell key="time">Time</Table.HeaderCell>
            <Table.HeaderCell key="gap">&nbsp;</Table.HeaderCell>
          </Table.Header>
          <Table.Body>
            {webhooks.map(w => (
              <>
                <Table.Row key={w!.node!.createdAt}>
                  <Table.Cell key="event">{w!.node!.event}</Table.Cell>
                  <Table.Cell key="time">{w!.node!.createdAt}</Table.Cell>
                  <Table.Cell key="resend" textAlign="right">
                    <Button
                      basic
                      content="Resend"
                      onClick={this.sendWebhook(props.relay.environment, props.installation.iID, w!.node!.eventID)}
                    />
                    <Button basic content="Show" onClick={this.getWebhook(props.installation.iID, w!.node!.eventID)} />
                  </Table.Cell>
                </Table.Row>
                {// If JSON has been requested, show it
                this.state.eventJSONs[w!.node!.eventID] && (
                  <tr>
                    <td colSpan={3}>
                      <div>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                          <code>{JSON.stringify(this.state.eventJSONs[w!.node!.eventID], null, "  ")}}</code>
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default createFragmentContainer<RProps>(
  Webhooks,
  graphql`
    fragment Webhooks_installation on Installation {
      iID
      ...WebhooksHeader_installation

      webhooks {
        edges {
          node {
            event
            iID
            createdAt
            eventID
          }
        }
      }
    }
  `
)
