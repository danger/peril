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
