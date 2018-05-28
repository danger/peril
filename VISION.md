# Why Bother?

Hosted Danger means being able to think about GitHub's webhook system as something trivial to build upon to make your
own workflows.

Hosted Danger comes with a few interesting aspects:

- Installation can literally be a single click on the website.
- Because Peril is not running Danger on CI, Danger can run against any webhook.
- Simpler security model:

  - no need to consider scope for tokens
  - no need to ensure bot has access to repo
  - no need to ensure token isn't leaked

I've wanted to do this for a [long, long time](https://github.com/danger/danger/issues/42) and the re-write aspect of
Danger JS means that I could apply the constraints necessary for running hosted from day-1.

# Minimum Viable Peril

Peril started in 2016, and hopefully with launch in 2018. I have to eventually make a line in the sand and say, this is
what we ship with. This is effectively the launch checklist.

## Runner

- [ ] Runs a Dangerfile with the Danger DSL on a PR event
- [ ] Runs a Dangerfile with webhook issue on other events
- [ ] Supports running async Dangerfiles easily
- [ ] Supports safely evaluating code

## Peril

- [ ] Allows regular scheduling of a task
- [ ] Allows scheduling of tasks in the future
- [ ] Allows deciding what events you're interested in running code from
- [ ] Allows storing ENV vars in a non-public way
- [ ] Keeps the database representation up-to-date with the repo

## Admin

- [ ] Can see orgs I need to set up
- [ ] Can see all the settings and keys for any orgs I'm in
- [ ] Can trigger a dev mode to record webhooks
- [ ] Can see the results of Danger runs inside the dashboard
- [ ] Can run any task from the admin to verify

## Homepage

- [ ] Can understand Peril in a single page
- [ ] Can describe pricing
- [ ] Can sign up for Peril
- [ ] Can get to guides
- [ ] Can get to tutorials
- [ ] Can get set up simply

![](https://ortastuff.s3.amazonaws.com/gifs/danger.gif)
