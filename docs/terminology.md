# Terminology

This gets confusing, so I'll try map out all the terms used inside Peril.

* *Danger* - the nodejs CLI tool that runs your code for cultural rules.
* *Peril* - the hosted server that takes GitHub events and runs danger against them.
* *GitHub* - currently the only core review site that Danger supports, and so also the only one for Peril.
* *Org* - A GitHub Organization. A collection of users and repos.
* *Repo* - A GitHub Repo.
* *Integration* - A GitHub API type, it allows external apps to get a feed of events and can have "[bot]" accounts.
* *Installation* - When a GitHub user adds an integration to an org, or a set of repos. This is the installation of an integration.
* *[bot] account* - An account for an integration, it has the word [bot] next to its name.
* *Event* - Any user interaction that happens on GitHub, within the context of your org.
* *Action* - An event can have a sub-action, so a `"issues"` event can have the actions of `"created"`, `"updated"`, etc.
