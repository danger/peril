import * as React from "react"
import { Link } from "gatsby"
import HeaderMenu from "../components/HeaderMenu/HeaderMenu"
import { withLayout, LayoutProps, menuItems } from "../components/Layout"
import { Button, Segment, Container, Grid, Header, Icon } from "semantic-ui-react"

const IndexPage = (props: LayoutProps) => (
  <div>
    <Segment vertical inverted textAlign="center" className="masthead">
      <HeaderMenu Link={Link} pathname={props.location.pathname} items={menuItems} inverted />
      <Container text>
        <Header inverted as="h1">
          Peril - Staging
        </Header>
        <Button primary size="huge">
          Get started!
        </Button>
      </Container>
    </Segment>

    <Segment vertical className="stripe">
      <Grid stackable verticalAlign="top" className="container">
        <Grid.Row>
          <Grid.Column width="8">
            <Header>What is Peril?</Header>
            <p>
              Peril is a GitHub App, you install it, and make a repo of JavaScript files which get triggered from events
              on your GitHub org.
            </p>
            <p>
              Peril makes it much simpler for you to own your engineering workflow by drastically reducing the friction
              to building new workflow improvements.
            </p>
          </Grid.Column>

          <Grid.Column width="8">
            <Header>How does it work?</Header>
            <p>These JavaScript files have access to the Peril and Danger API. As well as a set of npm modules.</p>
            <p>You can use this to build all sorts of systems.</p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>

    <Segment vertical className="stripe alternate feature">
      <Grid columns="3" textAlign="center" divided relaxed stackable className="container">
        <Grid.Row>
          <Grid.Column>
            <Header icon>Danger</Header>
            <p>Create a</p>
          </Grid.Column>
          <Grid.Column>
            <Header icon>
              <Icon name="wizard" />A kind of magic!
            </Header>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas eaque at quae cupiditate aspernatur
              quibusdam! Distinctio quod non, harum dolorum earum molestias, beatae expedita aliquam dolorem asperiores
              nemo amet quaerat.
            </p>
          </Grid.Column>
          <Grid.Column>
            <Header icon>
              <Icon name="wizard" />A kind of magic!
            </Header>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas eaque at quae cupiditate aspernatur
              quibusdam! Distinctio quod non, harum dolorum earum molestias, beatae expedita aliquam dolorem asperiores
              nemo amet quaerat.
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  </div>
)

export default withLayout(IndexPage)
