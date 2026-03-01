## Peril Staging

Peril Staging and Peril Production are orta-hosted instances of Peril with a few differences:

- There's a peril dashboard: https://staging-dashboard.peril.systems
- You can have many orgs running on the same server (I run artsy, danger, orta, CocoaPods, PerilTest for example)
- Each Peril run is a fresh Docker VM
- Peril can send logs of a Dangerfile run to Slack, or to the admin dashboard (WIP, currently broken)
- Peril can store 5 minutes of webhooks from GitHub to your org, and replay them so you can work on a feature
- The scheduler is set up, allowing you to have repeat tasks or to run a dangerfile in the future

It's structured like this:

<img src="https://github.com/danger/peril/raw/master/docs/images/peril-setup.png">

## Setup

Anyone can add Peril to their org, via the GitHub app using the sign-up link on: https://staging-dashboard.peril.systems

But only people who are in the danger org can turn the Peril on for their org.

## Docs

The only docs are in this repo:

- https://github.com/danger/peril/blob/master/docs/settings_repo_info.md
- https://github.com/danger/peril/blob/master/docs/architecture.md

I'm working on user-facing docs, but they're not there today. It'll be on https://staging.peril.systems one of days. I
waited until the dashboard was done before thinking about the user-facing docs.
