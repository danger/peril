# Terminology

This gets confusing, so I'll try map out all the terms used inside Peril.

* *Danger* - the nodejs CLI tool that runs your code for cultural rules.
* *Peril* - the hosted server that takes GitHub events and runs danger against them.
* *GitHub* - currently the only core review site that Danger supports, and so also the only one for Peril.
* *Org* - A GitHub Organization. A collection of users and repos.
* *Repo* - A GitHub Repo.
* *GitHub App* - A GitHub API type, it allows external apps to get a feed of events and can have "[bot]" accounts.
* *Installation* - When a GitHub user adds a GitHub app to an org, or a set of repos. Each repo (or one for all repos) is an installation.
* *[bot] account* - An account for an integration, it has the word [bot] next to its name.
* *Event* - Any user interaction that happens on GitHub, within the context of your org. See this [link for all events](https://developer.github.com/webhooks/#events).
* *Action* - An event can have a sub-action, so a `"issues"` event can have the actions of `"created"`, `"updated"`, etc.
