import * as React from "react"
import { QueryRenderer } from "react-relay"
import graphql from 'babel-plugin-relay/macro';


import { Container } from "semantic-ui-react"
import initEnvironment from "../lib/createRelayEnvironment"
import { customLoginRedirect, partialInstallation } from "../lib/routes"
import SetJSONPathForm from "./partial/SetJSONPathForm"

declare const location:any

export default class PartialInstallation extends React.Component<any> {
  public render() {
    // Comes from either react-router getting it from the urls, or from GitHub's
    // redirect which adds it to the query params.
    const installationID =
      this.props.match.params.installationID || new URL(location.href).searchParams.get("installation_id")

    return (
      <QueryRenderer
        environment={initEnvironment()}
        query={graphql`
          query PartialInstallationQuery($id: Int!) {
            installation(iID: $id) {
              login
              ...SetJSONPathForm_installation
            }
          }
        `}
        variables={{ id: installationID }}
        render={({ error, props }) => {
          if (error) {
            return <div>Error!</div>
          }
          if (!props) {
            return <div>Loading...</div>
          }

          if (!props.installation) {
            // Probably logged out, go through the login process and come back
            document.location.replace(customLoginRedirect(partialInstallation(installationID)))
          }

          return (
            <Container style={{ paddingTop: "5em", paddingBottom: "5em" }} text>
              <h1>{props.installation.login}</h1>
              <p>
                The Peril-side of the integration is ready. To get started, you will need to have a peril settings JSON
                url. These look like:{" "}
                <a href="https://github.com/danger/peril-settings/blob/master/settings.json">
                  <code>danger/peril-settings@settings.json</code>
                </a>
              </p>
              <SetJSONPathForm installation={props.installation as any} />
            </Container>
          )
        }}
      />
    )
  }
}
