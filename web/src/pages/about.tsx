import * as React from "react";
import { Header, Container, Segment, Icon } from "semantic-ui-react";
import {withLayout} from "../components/Layout";

const AboutPage = () => {
  return (
    <Container>
      <Segment vertical>
        <Header as="h2">
          <Icon name="info circle" />
          <Header.Content>
            About
          </Header.Content>
        </Header>
      </Segment>
      <Segment vertical>
        <p>
          This starter was created by @fabien0102.
        </p>
        <p>
          For any question, I'm on <a href="https://discord.gg/2bz8EzW" target="blank">discord #reactiflux/gatsby</a>
        </p>
        <p>
          For any issues, any PR are welcoming
          <a href="https://github.com/fabien0102/gatsby-starter/issues" target="blank"> on this repository</a>
        </p>
      </Segment>
    </Container>
  );
};

export default withLayout(AboutPage);
