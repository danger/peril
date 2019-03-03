# 2019 - March 3rd

Support having the Peril runtime be an AWS lamda job - orta

# 2019 - Feb 9

Move to a mono-repo - orta

# 2018 - Nov 10

You can opt out of checks support in your settings by adding `"disable_github_check": true` to your settings section. -
orta

## 2018 - Sept 8

**BREAKING**

This isn't _breaking_ per-say, more that the default behavior for `pull_request` will now be more inline with how people
perceive it to act. Including myself.

Prior to this change; creating a new PR could trigger `1 to n` webhooks depending on whether you've assigned reviewers,
assignees, added labels etc. Realistically, Peril shouldn't be running 5-6 times on the creation of a PR and that can
have simple side effects like duped comments, or do more work than you expect. So, this really simplifies the
responsibilities of `pull_request` and makes it just the _key_ things that people are interested in.

If you need that functionality, use `pull_request.*` instead, and you'll get them all :+1:

- orta (see https://github.com/danger/peril/issues/371)

## 2018 - Sept 7

Adds support for Sentry using if you set `SENTRY_DSN` in the env - orta

## 2018 - Sept 2

**BREAKING**

Replaces the scheduled task system with a fresh re-write and a new perspective now that I've had it running for a few
months.

This [issue covers](https://github.com/danger/peril/issues/361) what I want from the new scheduler (and why)

Basically if you're using the regular occurring scheduler I'd recommend reading the docs for
[the scheduler](https://github.com/danger/peril/blob/master/docs/settings_repo_info.md#scheduler)

but roughly, the keys in your `"scheduler"` now need to be one of the following: `"hourly"`, `"daily"`, `"weekly"`,
`"monday-morning-est"`, `"tuesday-morning-est"`, `"wednesday-morning-est"`, `"thursday-morning-est"`,
`"friday-morning-est"`.

There will be more keys in the future, but this covers all of my cases today.

## 2018 - Sept 1

- Fixes mis-attribution of the repo when an event's dangerfiles are between more than one repo - orta/barbosa

## 2018 - August 27

Migrated the repeated task scheduler to use agenda, this means it can take human readable strings, not just cron jobs -
orta Decided to migrate schedulers to not allow free-form cron-like syntax - so expect breaking changes here in the
future. - orta (see https://github.com/danger/peril/issues/361)

## 2018 - August 26

- All Peril run logs get sent to slack - orta

## 2018 - August 25

- The edit an installation mutation allows setting a `installationSlackUpdateWebhookURL` on your installation, which
  Peril will use to send messages to your installation - orta

- Generic rules for all the org now default to the settings JSON repo, reducing dupes in the settings json - orta

```diff
{
  "$schema": "https://raw.githubusercontent.com/danger/peril/master/peril-settings-json.schema",
  "rules": {
    "create (ref_type == tag)": [
+      "org/new_tag.ts",
-      "danger/peril-settings@org/new_tag.ts",
+      "org/updateDangerSystems.ts",
-      "danger/peril-settings@org/updateDangerSystems.ts"
    ],
+    "pull_request.closed": "org/aeryn.ts",
-    "pull_request.closed": "danger/peril-settings@org/aeryn.ts",
+    "pull_request": ["org/debug.ts", "org/changelog.ts"],
-    "pull_request": ["danger/peril-settings@org/debug.ts", "danger/peril-settings@org/changelog.ts"],
+    "issue_comment": "org/markAsMergeOnGreen.ts",
-    "issue_comment": "danger/peril-settings@org/markAsMergeOnGreen.ts",
+    "issues.opened": "org/checkTemplate.ts",
-    "issues.opened": "danger/peril-settings@org/checkTemplate.ts",
+    "status.success": "org/mergeOnGreen.ts"
-    "status.success": "danger/peril-settings@org/mergeOnGreen.ts"
  },
  "tasks": {
+    "trigger-scheduler": "testing/trigger-scheduler.ts",
-    "trigger-scheduler": "danger/peril-settings@testing/trigger-scheduler.ts",
+    "logger": "testing/logger.ts"
-    "logger": "danger/peril-settings@testing/logger.ts"
  }
}
```

I'll update thee docs later, once I'm certain all the edge cases are handled.

## 2018 - August 5

- Adds support for relative file imports inside a Dangerfile - orta

## 2018 - July 21

- Bug fix for recording webhooks, and updating the settings json from PR/pushes - orta

## 2018 - July 21

- Adds scheduler to staging - orta

## 2018 - July 7

- Fixes to the scheduled tasks feature - orta / MrCloud

## 2018 - June 8

- Improvements to the websockets information, all events now send names. - orta

## 2018 - June 8

- Running a task fixes - orta
- GitHubUtils now are now generated at runtime for event based PRs - orta

## 2018 - May 28

- Adds a webhook system which allows admins to see:

  - when a dangerfile is triggered
  - the logs for a dangerfile

  I'm still a little stuck on the client side (haven't figured how to run some code client-side with next) so it's still
  incubating, but the whole idea works. - orta

- Adds apollo engine for debugging to the graphql api - orta

## 2018 - May 21

- Adds a new mutation for scheduling a task from a sandboxed run, where it doesn't have access to the agenda runtime -
  orta

## 2018 - May 21

- Adds a JSON schema for the settings json - orta

## 2018 - May 20

- Uses checks now - orta

## 2018 - May 17

[BREAKING CHANGES]

- Merged in Danger JS changes for multiple execution runs, and checks instead of comments you will need Checks API
  permissions, see the updated setup docs - orta

## 2018 - May 13

- Danger rules can use keypaths to determine if they should run - orta

## 2018 - May 9

- Added mutations for adding/editing/deleting env vars for hosted Peril - orta
- Hosted Peril can now have env vars in the DSL - orta

## 2018 - May 7

- Added mutations for re-sending a webhook through Peril - orta
- Fixed CORs support - orta

## 2018 - May 6

- Allows multiple inline events to trigger rules - SD10

## 2018 - April 28

- Adds initial support for recording all Webhooks going to an installation for 5 minutes - orta (idea from ashfurrow)
- Refactored a bunch of disparate event based routing into "plugins" still some better abstractions to go there but this
  is a good start - orta/pedrovereza

## 2018 - April 27

- The logs have been artistically hand crafted to feel good - orta

## 2018 - April 26

[BREAKING CHANGES]

- Events, Tasks and Jobs all support Dangerfiles which have a default export function, in those cases the webhook/task
  data will be passed into the function as it's first argument. This is now the recommended way to get the event data.

  Before:

  ```ts
  // Stores the parameter in a closure that can be invoked in tests.
  const storeRFC = (reason: string, closure: () => void | Promise<any>) =>
    // We return a closure here so that the (promise is resolved|closure is invoked)
    // during test time and not when we call rfc().
    () => (closure instanceof Promise ? closure : Promise.resolve(closure()))

  // Either schedules the promise for execution via Danger, or invokes closure.
  const runRFC = (reason: string, closure: () => void | Promise<any>) => schedule(closure)

  const rfc: any = isJest ? storeRFC : runRFC

  // Note: Current WebHook for testing: 7ea07170-ee5e-11e7-827d-967e155710e3
  //
  export const newTag = rfc("Send a comment to PRs on new tags that they have been released", async () => {
    const api = danger.github.api
    const gh = (danger.github as any) as Create
  ```

  After:

  ```ts
  export default async (create: Create) => {
  ```

  This makes it:

  1.  Trivial to Test, you can just import the file now
  2.  Conceptually much simpler to think about. A PR Dangerfile still has the same DSL, but an event run is "just a
      function"
  3.  Async work feels better now

## 2018 - April 24

- You can authenticate to Peril using 'Authenticate: Basic xxxyyzzz" with your JWT - orta

## 2018 - April 23

- Peril can redirect you to the GitHub app install page - orta

## 2018 - April 22

- Improvements to the GQL API - orta

## 2018 - April 21

- Created a real staging environment: https://staging-api.peril.systems/ - orta
- Peril is much more liberal about updating an installation's DB, PRs or pushes to the settings repo will trigger
  updates - orta

## 2018 - April 20

- Updated node to 9 - orta
- Does CHANGELOG checking on push - orta
- Adds a JWT auth system for API access to installations - orta
- Adds a GraphQL API for installation data - orta
- Consolidates the mongoDB representation, and the in-memory GitHubInstallation interfaces - orta

## 2017-09-21

- Updated node to 8.4 - orta
- Updated Danger to 2.0a16 - orta
- Added the ability to skip specific repos - orta

## 2017-08-25

Added the ability to expose an ENV var via the `peril` object in the runtime, I wanted to use the Slack API in one of
our Artsy Dangerfiles, but there wasn't a way to actually pass the secret to the Dangerfile. - orta
