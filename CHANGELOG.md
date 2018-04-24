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
