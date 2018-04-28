## 2018 - April 27

* The logs have been artistically hand crafted to feel good - orta

## 2018 - April 26

[BREAKING CHANGES]

* Events, Tasks and Jobs all support Dangerfiles which have a default export function, in those cases the webhook/task
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

* You can authenticate to Peril using 'Authenticate: Basic xxxyyzzz" with your JWT - orta

## 2018 - April 23

* Peril can redirect you to the GitHub app install page - orta

## 2018 - April 22

* Improvements to the GQL API - orta

## 2018 - April 21

* Created a real staging environment: https://staging-api.peril.systems/ - orta
* Peril is much more liberal about updating an installation's DB, PRs or pushes to the settings repo will trigger
  updates - orta

## 2018 - April 20

* Updated node to 9 - orta
* Does CHANGELOG checking on push - orta
* Adds a JWT auth system for API access to installations - orta
* Adds a GraphQL API for installation data - orta
* Consolidates the mongoDB representation, and the in-memory GitHubInstallation interfaces - orta

## 2017-09-21

* Updated node to 8.4 - orta
* Updated Danger to 2.0a16 - orta
* Added the ability to skip specific repos - orta

## 2017-08-25

Added the ability to expose an ENV var via the `peril` object in the runtime, I wanted to use the Slack API in one of
our Artsy Dangerfiles, but there wasn't a way to actually pass the secret to the Dangerfile. - orta
