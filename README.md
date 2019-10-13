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

### Peril vs GitHub Actions. 

80% of Peril is available today in GitHub Actions. Key things which are not:

- Multi-repo support ([which is on the Actions roadmap](https://twitter.com/chrisrpatterson/status/1162531343248633858))
- Pre-workflow evaluation on webhook data (basically the ability to refuse to run the workflow unless something is set in the webhook JSON)
- Triggering delayed jobs from webhooks (e.g. do this thing in 5m)

Is this enough to warrant self-hosting? Maybe, but it's pushing it a bit if you aren't comfortable hosting a JS project.
Danger got extended with a [lot of Peril's features](https://github.com/danger/danger-js/blob/master/CHANGELOG.md#500) in order to better support GitHub Actions during the alpha. 

Given that I, Orta, can't install Peril on the Microsoft GitHub org, and GitHub Actions has most of Peril's features - it's unlikely that I'll be building much more into the core. I'll keep it ticking though, it's not much work.

---

### I want to use Peril

You have two choices:

- Wait for me to ship Peril to production (probably mid-2019)
- Self-host your own Peril

### I want to run Peril for my org

OK, I made a quick tutorial for [running a private Peril against your org](./docs/setup_for_org.md) - this is for
Heroku, but the underlying principles work for all of them.

### I want to hack on Peril!

Ace, great, cool. So, it's a bit of a process. I'm not sure if this will get easier in time. It's a complex app. You can
find out [more here](./docs/local_dev.md).

### This Repo

This repo is a mono-repo with three main responsibilities:

- [api](/api) - The Peril WebHook + API
- [dashboard](/dashboard) - The Admin Panel for logged in users
- [web](/web) - A static website for the public

### Docs

- [Introducing Peril to the Artsy Org](http://artsy.github.io/blog/2017/09/04/Introducing-Peril/)
- [On the obsessive statelessness of Peril](http://artsy.github.io/blog/2018/06/18/On-Obsessive-Statelessness/)
- [Reference: Terminology](https://github.com/danger/peril/blob/master/docs/terminology.md)
- [Reference: Settings Repo JSON](https://github.com/danger/peril/blob/master/docs/settings_repo_info.md)
- [Reference: Running Peril Locally](https://github.com/danger/peril/blob/master/docs/local_dev.md)
