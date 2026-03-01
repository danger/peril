### How do debug agenda

Edit `now.staging.json` to include `DEBUG`

```diff
{
    "env": {
+     "DEBUG": "agenda:*"
    }
}
```

You can throw up a UI to the db using:

```sh
echo "http://localhost:3001"; npx agendash --db=[get this from .env] --collection=agendaJobs --port=3001
```

## How to debug hyper runs

For staging:

```sh
hyper func inspect peril-staging
```

To get the ENV, and set debug to true:

```sh
hyper func update  --env PERIL_BOT_USER_ID=34651588 --env DEBUG=* peril-staging
```
