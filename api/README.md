## How does Peril work?

<img src="https://github.com/danger/peril/raw/master/docs/images/peril-setup.png">

There are some key files where the magic happens:

- [source/routing/router.ts](source/routing/router.ts) - Decide what work to with GitHub events
- [source/github/events/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Coordinating running the Dangerfiles
- [source/runner/run.ts](source/runner/run.ts) - Run the Dangerfile in a sandbox

This is a _reasonably tested_ project, there's a lot in places where the code isn't going to change much now so they're
slowly getting covered.

Peril's main API is split into two components with three parts:

- ## The API

  The two main responsibilities of the API are to take webhooks from GitHub and convert those into Dangerfile runs, and
  to provide a GraphQL API for the dashboard. It is an express app, it doesn't try to be too fancy because the domain is
  reasonably complex WRT security.

  - Deploy: `yarn deploy:staging:api`
  - Logs: `yarn logs:staging`

- ## The Runner

  The runner is an AWS lambda, it has two parts. An
  [AWS Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) which is the Peril "runtime". Then
  a function per-org which sets up environment for the shared runtime layer.

  ### Layer

  The shared Peril infrastructure that grabs the Dangerfile and evaluates it. It's effectively a subset of the Peril
  server, and it's opening module is `source/runner/index.ts`.

  To understand how it is created, see: `source/scripts/generate-runner-deps.ts`. It will generate a subset of Peril's
  dependencies for the layer because there is a 250MB size limit for the layer and Perils is _450MB_ (!!).

  - Deploy: `yarn deploy:staging:layer`
  - [Layers on AWS](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/layers)

  ### Function

  A really basic set of files which are the CWD for the function. Enough to transpile JS/TS correctly and to handle
  evaluation for

  Then you can test evaluation:

  - Deploy: `yarn deploy:staging:runner`
  - [Functions on AWS](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions)

## Links

[Staging Infra + Links](../docs/using_peril_staging.md)
