import * as PropTypes from "prop-types"
import * as React from "react"

// Thank you https://github.com/robrichard
// https://github.com/robrichard/relay-context-provider
interface ProviderProps {
  environment: any
  variables: any
}

class RelayProvider extends React.Component<ProviderProps> {
  public getChildContext() {
    return {
      relay: {
        environment: this.props.environment,
        variables: this.props.variables
      }
    }
  }
  public render() {
    return this.props.children
  }
}

;(RelayProvider as any).childContextTypes = {
  relay: PropTypes.object.isRequired
}

export default RelayProvider
