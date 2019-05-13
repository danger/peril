import * as React from "react"
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom"

import Cookies from "universal-cookie"
import Home from "./components/Home"
import Installation from "./components/Installation"
import Layout from "./components/layout/Layout"
import Login from "./components/Login"
import PartialInstallation from "./components/PartialInstallation"

class App extends React.Component {
  public render() {
    const cookies = new Cookies()

    return (
      <Router>
        <Layout>
          <div>
            <Route
              exact
              path="/success"
              render={() => {
                const params = new URL(document.location as any).searchParams
                cookies.set("jwt", params.get("perilJWT")!)
                return <Redirect to="/" />
              }}
            />

            <Route
              exact
              path="/"
              render={() => {
                if (cookies.get("jwt")) {
                  return <Home />
                } else {
                  return <Login />
                }
              }}
            />

            <Route path="/installation/:installationID" component={Installation} />
            <Route path="/installed" component={PartialInstallation} />
            <Route path="/partial/:installationID" component={PartialInstallation} />
          </div>
        </Layout>
      </Router>
    )
  }
}

export default App
