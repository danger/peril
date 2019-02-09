import * as React from "react";
import { GatsbyLinkProps } from "gatsby-link";
import { Menu } from "semantic-ui-react";
import { times } from "lodash";

interface BlogPaginationProps extends React.HTMLProps<HTMLDivElement> {
  pathname: string;
  Link: React.ComponentClass<GatsbyLinkProps<any>>;
  pageCount: number;
}

export default (props: BlogPaginationProps) => {
  if (props.pageCount === 1) { return null; }
  const activeItem = props.pathname.startsWith("/blog/page/")
    ? props.pathname.split("/")[3]
    : "1";

  return (
    <Menu pagination>
      {times(props.pageCount, (index) => {
        const pageIndex = (index + 1).toString();

        const rangeStep = props.pageCount < 10 ? 5 : 3;
        const isInRange = (+pageIndex - rangeStep < +activeItem && +pageIndex + rangeStep > +activeItem);
        const isLastPage = (+pageIndex === props.pageCount);
        const isFirstPage = (+pageIndex === 1);
        if (isInRange || isFirstPage || isLastPage) {
          return (
            <Menu.Item
              key={pageIndex}
              style={{ cursor: "pointer" }}
              as={props.Link}
              to={`/blog/page/${pageIndex}/`}
              name={pageIndex}
              active={activeItem === pageIndex}
            />
          );
        } else {
          return (+pageIndex === props.pageCount - 1 || +pageIndex === 2)
            ? <Menu.Item key={pageIndex} disabled>...</Menu.Item>
            : null;
        }
      })}
    </Menu>
  );
};
