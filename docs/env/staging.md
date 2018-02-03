## Peril Staging

**Setup:**

* heroku: https://dashboard.heroku.com/apps/peril-danger-staging
* Uses a mongo instance: [mLab](https://dashboard.heroku.com/apps/peril-danger-staging/resources?justInstalledAddonServiceId=3dfb031f-23f4-4123-856f-5cb95ecdadc9)
* github app: https://github.com/organizations/danger/settings/apps/danger-in-peril
* hyper, auth'd as me
* hyper func: `hyper func inspect danger-peril-staging` running locally,

---

**Scripts:**

* Logs: `heroku logs --app peril-danger-staging --tail`
* Creating the hyper func: `hyper func create --size s1 --name danger-peril-staging dangersystems/peril node out/scripts/runner/index.js`
* Updating the container for a func: `hyper pull dangersystems/peril:runner` - it will call with the new peril docker image on the next func run
