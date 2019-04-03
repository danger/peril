## Peril Staging

**Setup:**

- Now.js: https://zeit.co/teams/peril
- DB: [Mongo Atlas](https://cloud.mongodb.com/v2/5adafbc80bd66b23d635b2bb#clusters)
- GitHub app: https://github.com/organizations/danger/settings/apps/danger-in-peril
- Dashboard: https://staging-dashboard.peril.systems
- Consumer front-end: https://staging-web.peril.systems
- API: https://staging-api.peril.systems
- GraphiQL: https://staging-api.peril.systems/api/graphiql

---

**Scripts:**

From the `api` folder:

- Logs: `logs:staging`
- Or https://zeit.co/deployments/staging-api.peril.systems/logs

Deployment:

- The API: `yarn deploy:staging:api`
- The Runner: `yarn deploy:staging:layer`
- The config for all runners: `yarn deploy:staging:layer`

---

- Secrets vars are a bit weird in now. You have team-wide secrets, that are then re-used in the env vars by aliases.
- Adding the pem to now is hard, I ended up making a file copy of both private and public, then doing this:
  `now secrets -T peril add stag_private_github_signing_key (cat thing.pem | base64)`. Fish only.
