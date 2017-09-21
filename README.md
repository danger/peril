### Peril

The centralized Danger server, freeing Danger from her CI confines. 👍

Want to understand what the plan is? Consult the [VISION.md](/VISION.md) 

---

### I want to run Peril for my org

OK, I made a quick tutorial for [running a private Peril against your org](./docs/setup_for_org.md).

### I want to hack on Peril!

Ace, great, cool. So, it's a bit of a process. I'm not sure if this will get easier in time. It's a complex app. You can find out [more here](./docs/local_dev.md)

## Code Overview

There are three files where the magic happens:

- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Running and coordinating a Dangerfile
- [source/githubevents/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/routing/router.ts](source/routing/router.ts) - Any unique work on GitHub events

This is an _reasonably tested_ project, there's a lot in places where the code isn't going to change much now so they're slowly getting covered.

### Exposing Peril to the public

In order to support danger.systems features, there is an ENV var `"PUBLIC_FACING_API"` that when truthy will expose an extra API route.

- `GET /api/v1/pr/dsl?owner=danger&repo=peril&number=14`

  This will return the DSL JSON for a specific Pull Request. Supports JSONP.

### Peril Settings

The `"settings"` section of the JSON file is how you can configure peril at a global level. It looks something like this:

```json
{
  "settings": {
    "modules": ["danger-plugin-yarn", "danger-plugin-spellcheck"],
    "env_vars": ["MY_CUSTOM_ENV_VAR]
  }
  ...
}
```

The full DSL is available inside [this file](https://github.com/danger/peril/blob/master/source/db/GitHubRepoSettings.ts).

#### Plugins / Modules

Right now you can add Danger plugins by adding a key `modules` with an array of string inside the settings object of your database.

These will be added to your install via `yarn add [plugins]` at heroku build-time. This means that to update your modules
you will need to ship a new commit to heroku. I'd recommend [this gist's](https://gist.github.com/csu/d22e60114051a0a182d2)
technique.

#### Env Vars

You might want to expose specific ENV VARs to your Dangerfiles, this will take the values from your `process.env` and put them on `peril.env` inside the Dangerfiles.
