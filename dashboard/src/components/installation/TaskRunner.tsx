import * as React from "react"
import { createFragmentContainer, graphql, RelayProp } from "react-relay"

import { Button, Dropdown, Segment } from "semantic-ui-react"
import { TaskRunner_installation } from "./__generated__/TaskRunner_installation.graphql"
import { runTaskMutation } from "./mutations/runTaskMutation"

interface Props {
  installation: TaskRunner_installation
}

interface State {
  selectedTask: string | null
}

type RProps = Props & { relay: RelayProp }

class InsideTaskRunner extends React.Component<RProps, State> {
  constructor(props: RProps) {
    super(props)
    this.state = { selectedTask: null }
  }

  public handleClick = () => this.submitTaskMutation()

  public handleKeyPress = (e: KeyboardEvent) => {
    if (e.charCode === 32 || e.charCode === 13) {
      // Prevent the default action to stop scrolling when space is pressed
      e.preventDefault()
      this.submitTaskMutation()
    }
  }

  public submitTaskMutation() {
    runTaskMutation(this.props.relay.environment, {
      iID: this.props.installation.iID,
      task: this.state.selectedTask!,
      data: {},
    })
  }

  public render() {
    const taskOptions = Object.keys(this.props.installation.tasks).map(key => ({
      key,
      text: key,
      value: key,
      content: key,
    }))

    return (
      <Segment vertical>
        <p>You can run any tasks as one-offs</p>
        <Button.Group>
          <Dropdown
            button
            className="icon"
            floating
            labeled
            labelposition="right"
            options={taskOptions}
            search
            text={this.state.selectedTask || "Select Task"}
            onChange={(_: any, b) => {
              this.setState({ selectedTask: b.value as string })
            }}
          />
          <Button
            labelPosition="right"
            icon="right chevron"
            content="Run Task"
            disabled={!this.state.selectedTask}
            onClick={this.handleClick}
            onKeyPress={this.handleKeyPress}
          />
        </Button.Group>
      </Segment>
    )
  }
}

export default createFragmentContainer<RProps>(
  InsideTaskRunner,
  graphql`
    fragment TaskRunner_installation on Installation {
      iID
      tasks
    }
  `
)
