# Peril Service Map

Peril Staging/Production is a combination of 5 different services:

- peril.systems
- dashboard.peril.systems
- api.peril.systems
- Lambda runners
- Danger JS

## Peril Systems (`/web`)

The public facing website for Peril, a Gatsby site which sells and documents Peril.

## Dashboard (`/dashboard`)

A Create-React App which uses TS + Relay against `api.peril.systems` to show logs, edit configuration and toggle dev
modes.

## API (`/api`)

Handles:

- User account management
- Org installation management
- Receiving webhooks from GitHub
- Assigning work for the runner based on the webhook
- Exposing a GraphQL API for the Web/Dashboard/Runner

For more, see [API architecture](https://github.com/danger/peril/blob/master/docs/api_architecture.md)

## Lambda Runners (`/api/source/runner`)

The environment which downloads, transpiles and executes JavaScript in. It receives an extended version of the same JSON
which occurs inside Danger JS (with additions like auth, webhook JSON etc) and when the JS is done - the runner
communicates back to the API and for PR events, back to the PR.

## Danger JS

The private API in Danger JS is used a bunch in Peril. Danger JS was built with Peril in mind from day 1 - so it's worth
considering a part of the Peril services.
