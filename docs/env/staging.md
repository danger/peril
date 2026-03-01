## Peril Staging

**Setup:**

* Now.js: https://zeit.co/teams/peril
* Uses a mongo instance: [Mongo Atlas](https://cloud.mongodb.com/v2/5adafbc80bd66b23d635b2bb#clusters)
* github app: https://github.com/organizations/danger/settings/apps/danger-in-peril
* hyper, auth'd as me: https://console.hyper.sh
* hyper func: `hyper func inspect peril-staging` running locally.

---

**Scripts:**

* Logs: `now logs staging-api.peril.systems -T peril`.
* Creating the hyper func:
  `hyper func create --size s3 --name peril-staging dangersystems/peril node out/scripts/runner/index.js`.
* Updating the container for a func: `hyper pull dangersystems/peril:runner` - it will call with the new peril docker
  image on the next func run. This is handled automatically by Peril.

---

**Tricky Bits**

* Secrets vars are a bit weird in now. You have team-wide secrets, that are then re-used in the env vars by alises.
* Adding the pem to now is hard, I ended up making a file copy of both private and public, then doing this:
  `now secrets -T peril add stag_private_github_signing_key (cat thing.pem | base64)`. Fish only.
