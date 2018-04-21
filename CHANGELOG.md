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
