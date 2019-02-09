# HeaderMenu component

Header menu component.

## Source

    <HeaderMenu items={items}  pathname={pathname} Link={Link} inverted={inverted} />

## Example of items

    const items = [
        {name: "Home", path: "/", exact: true},
        {name: "About", path: "/about/", exact: true},
        {name: "Blog", path: "/blog/", exact: false},
    ];

If `exact` is `false`, any `pathname` that starts with `path` will provide an active item.
