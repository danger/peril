<p align="center">
  <img src="http://danger.systems/images/js/peril-logo-hero-cachable@2x.png" width=250/>
</p>

[per·il](https://en.oxforddictionaries.com/definition/peril) **ˈperəl** _noun_

1.  serious and immediate danger. _"their family was in peril"_.

---

Peril is a tool that takes GitHub webhooks, and makes it easy to build one-off actions. It does this by having a
per-account settings JSON, that connects JavaScript files to events from webhooks. So, for example, you can write a rule
which runs when closing an issue in GitHub that looks for associated Jira tickets and resolves them. Peril provides no
implicit actions like that, it instead offers a JavaScript runtime environment optimised to this domain so you can make
actions to fit your needs.

Want to understand what the plan is? Consult the [VISION.md](/VISION.md)

---

Peril uses [Danger JS](https://github.com/danger/danger-js) under the hood, Danger is a tool built for adding extra
tests inside Pull Requests that can work at a different level of abstraction to unit and integration tests. For example,
you could write tests which:

- Enforce CHANGELOGs
- Enforce links to Trello/JIRA in PR/MR bodies
- Enforce using descriptive labels
- Look out for common anti-patterns
- Highlight interesting build artifacts
- Give warnings when specific files change

... and any other rules specific to your team's culture and needs.

---

### I want to run Peril for my org

OK, I made a quick tutorial for [running a private Peril against your org](./docs/setup_for_org.md).

### I want to hack on Peril!

Ace, great, cool. So, it's a bit of a process. I'm not sure if this will get easier in time. It's a complex app. You can
find out [more here](./docs/local_dev.md)

## How does Peril work?

<img src="https://github.com/danger/peril/raw/master/docs/images/peril-setup.png">

There are some key files where the magic happens:

- [source/routing/router.ts](source/routing/router.ts) - Decide what work to with GitHub events
- [source/githubevents/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Coordinating running the Dangerfiles
- [source/runner/run.ts](source/runner/run.ts) - Run the Dangerfile in a sandbox

This is an _reasonably tested_ project, there's a lot in places where the code isn't going to change much now so they're
slowly getting covered.

### Docs

- [Introducing Peril to the Artsy Org](http://artsy.github.io/blog/2017/09/04/Introducing-Peril/)
- [On the obsessive statelessness of Peril](http://artsy.github.io/blog/2018/06/18/On-Obsessive-Statelessness/)
- [Reference: Terminology](https://github.com/danger/peril/blob/master/docs/terminology.md)
- [Reference: Settings Repo JSON](https://github.com/danger/peril/blob/master/docs/settings_repo_info.md)
- [Reference: Running Peril Locally](https://github.com/danger/peril/blob/master/docs/local_dev.md)
