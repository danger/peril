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
