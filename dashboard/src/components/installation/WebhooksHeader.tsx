import * as React from "react"
import { createFragmentContainer, RelayProp } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { Button, Header, Icon, Segment } from "semantic-ui-react"
import relativeDate from "tiny-relative-date"
import { runRecordWebhooksMutation } from "./mutations/makeInstallationRecordMutation"

interface Props {
  installation: any
  relay?: RelayProp
}

const WebhooksHeaderInternal = (props: Props) => {
  const endRecording = props.installation.recordWebhooksUntilTime
  const startRecording = props.installation.startedRecordingWebhooksTime
  let isRecording = false
  if (endRecording && startRecording) {
    const endDate = new Date(endRecording)
    isRecording = new Date() < endDate
  }

  return (
    <div>
      <Header as="h2">Saved GitHub events</Header>
      <Segment clearing attached="top">
        <Button
          floated="right"
          icon
          disabled={isRecording}
          labelPosition="right"
          onClick={() => runRecordWebhooksMutation(props.relay!.environment, props.installation.iID)}
        >
          Record
          <Icon name="circle" />
        </Button>

        <p style={{ width: 400, float: "left" }}>
          Peril can record webhooks sent from GitHub for a 5 minutes period, then you can re-trigger them at any point.
        </p>
        {startRecording && (
          <p style={{ width: 400, float: "left" }}>Last recorded {relativeDate(new Date(startRecording))}.</p>
        )}
      </Segment>
    </div>
  )
}

export default createFragmentContainer<Props>(
  WebhooksHeaderInternal,
  { installation: graphql`
    fragment WebhooksHeader_installation on Installation {
      iID

      recordWebhooksUntilTime
      startedRecordingWebhooksTime
    }
  `}
)
