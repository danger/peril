## Peril's API Architecture

## GitHub Integration

Each GitHub org that is hooked up to Peril is called an installation. Today, everyone is doing 1 installation, one
server of Peril. However, Peril has been built to handle multiple installations from day one.

#### Launch

On launch, Peril needs to get enough information to set up the Dangerfile routing system. When you're hosting a
stand-alone server (e.g. for one org, on heroku) then Peril will make an auth'd request for the JSON that represents
your Peril settings. This is classed as a [JSON db][json_db].

For Peril staging/production, then the information comes at runtime via Mongo which stores info per-org.

#### A GitHub Webhook arrives

The Webhook arrives and is picked up in the [github router][gh_router], which has the responsibilities in handling any
Peril specific Webhooks (account creation / deletion etc) and then passing it forward to the [GitHub runner][gh_runner].

#### GitHub runner

This is where Peril uses the Peril settings from the JSON db for that installation to decide what to do with the
webhook. There are four main types of events you can get a webhook for.

- Event is org based (no repo, DSL is event JSON)
- Event is repo based (has a reference to a repo, but nothing to comment on)
- Event is PR based (has a repo + issue, can comment, gets normal DangerDSL)
- Event is issue based (has a repo + issue, can comment, gets event DSL )

Each one has different trade-offs. PRs need the full Danger DSL. An issue should support `fail`, `warn` etc. An org/repo
event can only really use the Octokit API.

The GitHub runner's responsibility is to get enough of the DSL set up to be able to be passed to the [Danger
Runner][danger_runner].

#### Danger Runner

The Danger runner is responsible for handling the Peril specifics for the Danger DSL, and for executing the job.

[json_db]: https://github.com/danger/peril/blob/master/source/db/json.ts
[gh_router]: https://github.com/danger/peril/blob/master/source/routing/router.ts
[gh_runner]: https://github.com/danger/peril/blob/master/source/github/events/github_runner.ts#L1
[danger_runner]: https://github.com/danger/peril/blob/master/source/danger/danger_runner.ts
