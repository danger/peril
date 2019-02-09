# TagsCard component

Component to have a pretty tags list from all posts.

## Source

    <TagsCard tags={props.data.tags} Link={Link}/>

## With tag property

    <TagsCard tags={props.data.tags} tag={tag} Link={Link}/>

## GraphQL query

    {
      # Get tags
      tags: allMarkdownRemark(frontmatter: {draft: {ne: true}}) {
        groupBy(field: frontmatter___tags) {
          fieldValue
          totalCount
        }
      }
    }

[open in graphiql](http://localhost:8000/graphql?query=%7B%0A%20%20%23%20Get%20tags%0A%20%20tags%3A%20allMarkdownRemark(frontmatter%3A%20%7Bdraft%3A%20%7Bne%3A%20true%7D%7D)%20%7B%0A%20%20%20%20groupBy(field%3A%20frontmatter___tags)%20%7B%0A%20%20%20%20%20%20fieldValue%0A%20%20%20%20%20%20totalCount%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D) (local only)
