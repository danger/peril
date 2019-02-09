import * as React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { Feed, Segment } from "semantic-ui-react"
import relativeDate from "tiny-relative-date"
import { Websocket_installation } from "./__generated__/Websocket_installation.graphql"

interface Props {
  installation: Websocket_installation
}

interface State {
  events: Notification[]
  connected?: boolean
}

declare const Primus: any

class Websocket extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { events: [] }
  }

  public componentDidMount() {
    // client side only
    console.log("Connecting to Peril's webserver")
    // const primus = new Primus(`https://staging-api.peril.systems?iID=${this.props.iID}`)
    const primus = new Primus(`${process.env.REACT_APP_PUBLIC_API_ROOT_URL}?iID=${this.props.installation.iID}`)

    // I do not understand why this doesn't work like I'd expect

    // primus.on("connection", spark => {
    //   this.setState({ connected: true })
    //   console.log("Connected")

    //   spark.on("data", data => {
    //     this.setState({ events: [...this.state.events, data] })
    //   })

    //   spark.write({ foo: "bar" })
    // })

    primus.on("data", (data: Notification) => {
      const datedData = {
        ...data,
        date: new Date(),
      }
      this.setState({ connected: true, events: [...this.state.events, datedData] })
    })

    primus.on("disconnection", () => {
      this.setState({ connected: false })
    })
  }

  public render() {
    const isConnecting = !Object.keys(this.state).includes("connected")
    let message
    switch (true) {
      case isConnecting:
        message = "Connecting..."
        break
      case this.state.connected:
        message = "Connected"
        break
      default:
        message = "Disconnected"
    }

    return (
      <div>
        <h4>WIP</h4>
        <Segment vertical>
          <p>{message}</p>

          <Feed>
            {this.state.events.map(e => {
              switch (e.action) {
                case "connected":
                  return connectedEvent(e)

                case "started":
                  return dangerfileStartedEvent(this.props.installation.perilSettingsJSONURL, e)

                case "finished":
                  return dangerfileFinishedEvent(e)

                case "log":
                  return dangerfileLogEvent(e)
              }
            })}
          </Feed>
        </Segment>
      </div>
    )
  }
}

export default createFragmentContainer<Props>(
  Websocket,
  graphql`
    fragment Websocket_installation on Installation {
      iID
      perilSettingsJSONURL
    }
  `
)

// Taken from Peril

type Notification = MSGDangerfileStarted | MSGDangerfileFinished | MSGDangerfileLog | MSGConnected

interface MSGConnected {
  action: "connected"
  connected: boolean
  date: Date
}

interface MSGDangerfileStarted {
  action: "started"
  event: string
  filenames: string[]
  date: Date
}

interface MSGDangerfileFinished {
  action: "finished"
  event: string
  filenames: string[]

  time: number
  date: Date
}

interface MSGDangerfileLog {
  action: "log"
  event: string

  filenames: string[]
  log: string
  date: Date
}

export const dangerRepresentationForPath = (value: string) => {
  const afterAt = value.includes("@") ? value.split("@")[1] : value
  return {
    branch: value.includes("#") ? value.split("#")[1] : "master",
    dangerfilePath: afterAt.split("#")[0],
    repoSlug: value.includes("@") ? value.split("@")[0] : undefined,
    referenceString: value,
  }
}

const dangerfileRefToHref = (settingsPath: string, dangerfile: string) => {
  const settingsJSON = dangerRepresentationForPath(settingsPath)
  const dangerfileRep = dangerRepresentationForPath(dangerfile)
  const repo = dangerfileRep.repoSlug || settingsJSON.repoSlug!
  const ref = dangerfileRep.branch || "master"
  // e.g.
  // https://github.com/danger/dashboard.peril.systems/blob/[sha]/src/components/installation/Websocket.tsx
  const url = `https://github.com/${repo}/blob/${ref}/${dangerfileRep.dangerfilePath}`
  return `<a href="${url}">${dangerfile}</a>`
}

const connectedEvent = (event: MSGConnected) => (
  <Feed.Event key={`connected-$[event.date}`}>
    <Feed.Content>
      <Feed.Summary>
        Connected
        <Feed.Date>{relativeDate(event.date)}</Feed.Date>
      </Feed.Summary>
    </Feed.Content>
  </Feed.Event>
)

const dangerfileStartedEvent = (settingsJSONFile: string, event: MSGDangerfileStarted) => (
  <Feed.Event>
    <Feed.Content>
      <Feed.Summary>
        <Feed.User>{event.event}</Feed.User> has started
        <Feed.Date>{relativeDate(event.date)}</Feed.Date>
      </Feed.Summary>
      <Feed.Meta>
        <Feed.Like>
          <p
            dangerouslySetInnerHTML={{
              __html: event.filenames.map(f => dangerfileRefToHref(settingsJSONFile, f)).join(", "),
            }}
          />
        </Feed.Like>
      </Feed.Meta>
    </Feed.Content>
  </Feed.Event>
)

const dangerfileFinishedEvent = (event: MSGDangerfileFinished) => (
  <Feed.Event>
    <Feed.Content>
      <Feed.Summary>
        <Feed.User>{event.event}</Feed.User> has finished
        <Feed.Date>{relativeDate(event.date)}</Feed.Date>
      </Feed.Summary>
    </Feed.Content>
  </Feed.Event>
)

const dangerfileLogEvent = (event: MSGDangerfileLog) => (
  <Feed.Event>
    <Feed.Content>
      <Feed.Summary>
        Got Logs for <Feed.User>{event.event}</Feed.User>
        <Feed.Date>{relativeDate(event.date)}</Feed.Date>
        <Feed.Extra text>
          <pre>{event.log}</pre>
        </Feed.Extra>
      </Feed.Summary>
    </Feed.Content>
  </Feed.Event>
)
