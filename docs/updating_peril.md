## Updating Peril

If you have deployed peril using Heroku, you can update your deployment by cloning your deployment locally through your Heroku Git URL:

```
git clone https://git.heroku.com/[your-app-name].git
cd [your-app-name]
```

Then you can add the peril main repo as a remote and pull the latest changes:
```
git remote add peril https://github.com/danger/peril.git
git pull peril master
git push heroku master
```
