/* tslint:disable no-var-requires */
const withReadme = (require("storybook-readme/with-readme") as any).default;
const BlogPaginationReadme = require("./README.md");

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, number } from "@storybook/addon-knobs";
import BlogPagination from "./BlogPagination";

const LinkStub = ((props: any) =>
  <div {...props} onClick={action(props.to.toString())} >{props.children}</div>) as any;

storiesOf("BlogPagination", module)
  .addDecorator(withReadme(BlogPaginationReadme))
  .addDecorator(withKnobs)
  .add("default", () => {
    const activePage = number("activePage", 1);
    const pathname = `/blog/page/${activePage}/`;
    const pageCount = number("pageCount", 10);

    return (
      <BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />
    );
  });
