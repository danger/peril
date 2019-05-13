import * as React from "react"
import { createFragmentContainer,  RelayProp } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { Segment } from "semantic-ui-react"
import { githubURLForReference } from "../../lib/dangerfileReferenceURLs"
import { InstallationRules_installation } from "./__generated__/InstallationRules_installation.graphql"

interface Props {
  installation: InstallationRules_installation
}

export const InstallationRules: any = (props: Props & { relay: RelayProp }) => {
  if (!props.installation) {
    return <div />
  }

  const visibleSettings = {
    rules: props.installation.rules,
    repos: props.installation.repos,
    tasks: props.installation.tasks,
    scheduler: props.installation.scheduler,
  }
  const url = props.installation.perilSettingsJSONURL
  return (
    <Segment>
      <div className="ui top left attached label">Peril settings</div>
      <div className="ui top right attached label">
        <a href={githubURLForReference(url)}>{url}</a>
      </div>

      <pre style={{ overflowX: "scroll", marginTop: 30 }}>{JSON.stringify(visibleSettings, null, "  ")}</pre>
    </Segment>
  )
}

export default createFragmentContainer<Props>(
  InstallationRules,
  { installation: 
  graphql`
    fragment InstallationRules_installation on Installation {
      iID
      repos
      rules
      tasks
      scheduler
      perilSettingsJSONURL
    }
  `
  }
)
