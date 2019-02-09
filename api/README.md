## How does Peril work?

<img src="https://github.com/danger/peril/raw/master/docs/images/peril-setup.png">

There are some key files where the magic happens:

- [source/routing/router.ts](source/routing/router.ts) - Decide what work to with GitHub events
- [source/github/events/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Coordinating running the Dangerfiles
- [source/runner/run.ts](source/runner/run.ts) - Run the Dangerfile in a sandbox

This is a _reasonably tested_ project, there's a lot in places where the code isn't going to change much now so they're
slowly getting covered.
