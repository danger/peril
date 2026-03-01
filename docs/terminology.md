# Terminology

This gets confusing, so I'll try map out all the terms used inside Peril.

- _Danger_ - the nodejs CLI tool that runs your code for cultural rules.
- _Peril_ - the hosted server that takes GitHub events and runs danger against them.
- _GitHub_ - currently the only core review site that Danger supports, and so also the only one for Peril.
- _Org_ - A GitHub Organization. A collection of users and repos.
- _Repo_ - A GitHub Repo.
- _GitHub App_ - A GitHub API type, it allows external apps to get a feed of events and can have "[bot]" accounts.
- _Installation_ - When a GitHub user adds a GitHub app to an org, or a set of repos. Each repo (or one for all repos)
  is an installation.
- _[bot] account_ - An account for an integration, it has the word [bot] next to its name.
- _Event_ - Any user interaction that happens on GitHub, within the context of your org. See this
  [link for all events](https://developer.github.com/webhooks/#events).
- _Action_ - An event can have a sub-action, so a `"issues"` event can have the actions of `"created"`, `"updated"`,
  etc.
- _Staging/Prod_ - Orta's hosted version of Peril, that handles multiple settings repos for many org/users. It is Mongo
  based, and uses a Docker Runner
- _JSON based host_ - A Peril instance that uses a single JSON repo, it doesn't keep a copy of the installation inside
  the MongoDB
- _Mongo based host_ - A Peril instance that does not use `DATABASE_JSON_FILE`, but instead works via GitHub webhooks
  and the GraphQL API
- _Inline Danger Runner_ - When the dangerfile is eval'd inside the same process as Peril, you must trust all code in
  this situation.
- _Docker Danger Runner_ - Using Peril as a docker container, from the runner tag on
  [dangersystems/peril](https://hub.docker.com/r/dangersystems/peril/) to evaluate JS code in a safe, fresh environment
  each time
