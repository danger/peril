import * as React from "react"

import { createFragmentContainer } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { Image, Header } from "semantic-ui-react"
import { Overview_installation } from "./__generated__/Overview_installation.graphql"

const OverviewInternal = (props: Props) => (
  <div>
    <Header as="h2">
      <Image circular src={props.installation.avatarURL} /> {props.installation.login}
    </Header>
  </div>
)

interface Props {
  installation: Overview_installation
}

export default createFragmentContainer<Props>(
  OverviewInternal,
  { installation: graphql`
    fragment Overview_installation on Installation {
      iID
      login
      avatarURL
    }
  `}
)
