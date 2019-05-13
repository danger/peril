import * as React from "react"
import {  QueryRenderer } from "react-relay"
import graphql from 'babel-plugin-relay/macro';

import { BrowserRouter as Router, NavLink, Route } from "react-router-dom"
import { Container, Menu } from "semantic-ui-react"
import initEnvironment from "../lib/createRelayEnvironment"
import EnvVars from "./installation/EnvVars"
import InstallationRules from "./installation/InstallationRules"
import Overview from "./installation/Overview"
import Settings from "./installation/Settings"
import TaskRunner from "./installation/TaskRunner"
import Webhooks from "./installation/Webhooks"
import Websocket from "./installation/Websocket"

export default class Installation extends React.Component<any, any> {
  public state = { activeItem: "home" }

  public render() {
    const installationID = this.props.match.params.installationID
    console.log(installationID)

    return (
      <QueryRenderer
        environment={initEnvironment()}
        query={graphql`
          query InstallationQuery($id: Int!) {
            installation(iID: $id) {
              iID

              ...Overview_installation
              ...InstallationRules_installation
              ...Webhooks_installation
              ...TaskRunner_installation
              ...Websocket_installation
              ...Settings_installation
              ...EnvVars_installation
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

          const urlPrefix = `/installation/${installationID}/`
          return (
            <Router>
              <Container style={{ paddingTop: "5em", paddingBottom: "5em" }} text>
                <Overview installation={props.installation} />

                <Menu pointing secondary>
                  <Menu.Item as={NavLink} exact to={urlPrefix} content="Overview" />
                  <Menu.Item as={NavLink} to={urlPrefix + "webhooks"} content="Webhooks" />
                  <Menu.Item as={NavLink} to={urlPrefix + "tasks"} content="Tasks" />
                  <Menu.Item as={NavLink} to={urlPrefix + "logs"} content="Logs" />
                  <Menu.Item as={NavLink} to={urlPrefix + "settings"} content="Settings" />
                </Menu>

                <div style={{ marginTop: 20 }}>
                  <Route
                    path="/installation/:installationID/"
                    component={() => (
                      <div>
                        <InstallationRules installation={props.installation} />
                      </div>
                    )}
                    exact
                  />

                  <Route
                    path="/installation/:installationID/tasks"
                    component={() => <TaskRunner installation={props.installation} />}
                    exact
                  />

                  <Route
                    path="/installation/:installationID/webhooks"
                    component={() => <Webhooks installation={props.installation} />}
                    exact
                  />

                  <Route
                    path="/installation/:installationID/logs"
                    component={() => <Websocket installation={props.installation} />}
                    exact
                  />

                  <Route
                    path="/installation/:installationID/settings"
                    component={() => (
                      <div>
                        <Settings installation={props.installation} />
                        <EnvVars installation={props.installation} />
                      </div>
                    )}
                    exact
                  />
                </div>
              </Container>
            </Router>
          )
        }}
      />
    )
  }
}
