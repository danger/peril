![](https://ortastuff.s3.amazonaws.com/gifs/danger.gif)

### Why Bother?

Hosted Danger comes with a few interesting aspects:

* Installation can literally be a single click on the website.
* Because Peril is not running Danger on CI, Danger can run against any webhook.
* Simpler security model:

  * no need to consider scope for tokens
  * no need to ensure bot has access to repo
  * no need to ensure token isn't leaked

I've wanted to do this for a [long, long time](https://github.com/danger/danger/issues/42) and the re-write aspect of
Danger JS means that I could apply the constraints necessary for running hosted from day-1.

### Long term plan

I'm wary of creating a web service that can be business critical in my spare time. I've done this before with the
CocoaDocs infrastructure, and it consumed a massive amount of time. So, I'm taking this one slow.

Things that need to be done before any sort of semi-public beta:

* https for peril
* process separation for sandboxing eval
* danger scoping for saying run this on an "issue"

### Short term plan

As with Danger-JS, I'll be starting off with just the infrastructure I use: namely building GitHub integration using
their new "[Integrations](https://developer.github.com/early-access/integrations/)" thing.

I have zero problems with adding support for other code review tools.
