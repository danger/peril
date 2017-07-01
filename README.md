### Peril

The centralized Danger server, freeing Danger from her CI confines. 👍

Want to understand what the plan is? Consult the [VISION.md](/VISION.md) 

---

### I want to run Peril for my org

OK, I made a quick tutorial for [running a private Peril against your org](./docs/setup_for_org.md).

### I want to hack on Peril!

Ace, great, cool. So, it's a bit of a process. I'm not sure if this will get easier in time. It's a complex app.

*Warning*: Until [#48][48] and other security measures are put in place Peril should be considered *insecure* for any public-facing use. For now, the setting `onlyForOrgMembers` can reduce the chances of their being an issue of data leakage.

### Setting up to work on Peril

```sh
git clone https://github.com/danger/peril.git
cd peril
yarn install
```

Peril is a TypeScript project, so I'd recommend using VS Code. The project is pretty well tested now, so it's very possible that to make the changes you want you can just do it in the tests to verify.

However, if you would like a full setup for local development:

You can then run the project with `yarn start`. For running on your server, you're going to need: 

* A GitHub [integration][] 
* A tiny postgres database
* The ability to go in and make changes to your database (I use [Postico][])

Notes on the integration:

* They share a global namespace for names, so "peril-[me]" rather than "peril".
* You can make them apply to just an org, then randos can't sign up for your integration. That's at the bottom of the create integration page.
* You can find the create integration in User or Org settings.
* The integration will give you a private key to download, that you'll use in the ENV vars below

That should get you enough to set up your ENV vars:

```sh
PRIVATE_GITHUB_SIGNING_KEY = "-----BEGIN RSA PRIVATE KEY----- [snip] -----END RSA PRIVATE KEY-----"
PERIL_INTEGRATION_ID=1839
WEB_URL=https://peril-staging.herokuapp.com

# Either this, if you are going to have Peril only work for one org
DATABASE_JSON_FILE=orta/peril@settings.json
# Or
DATABASE_URL=postgres://localhost:5432/peril-dev
PAPERTRAIL_URL=logs3.papertrailapp.com
PAPERTRAIL_PORT=28486
PERIL_BOT_USER_ID=1839
```

Notes:

- The `PERIL_BOT_USER_ID` you don't need at first, you can get it working with any number (it's used for updating/deleting posts).
- The `PRIVATE_GITHUB_SIGNING_KEY` can be set with something like `heroku config:add PRIVATE_GITHUB_SIGNING_KEY=$(cat /Users/orta/Downloads/peril-staging.2017-03-23.private-key.pem )`.
- The `WEB_URL` isn't used yet.
- The `PAPERTRAIL_URL` / `PAPERTRAIL_PORT` vars are optional, but are useful for reading server logs.

---

So, you got the server up and running, now you need to install your GitHub integration in your org. If you've already done this, you can go into your integration admin panel and re-send the event, or re-install.

You should get a reply back from peril [saying](source/github/events/create_installation.ts#L8) `"Creating new installation"`.

Now, any other GitHub event goes to peril and is handled by the [GitHub runner](source/github/events/github_runner.ts). This is powered by JSON and a set of rules called [DangerRunRules](master/source/danger/danger_run.ts) - these bind GitHub event names + actions to actions in danger. E.g.

```json
"rules": {
  "pull_request": "Dangerfile.js",
  "issue": "danger/issues.js"
}
```

* When an event `"pull_request"` comes in, it will look in the current repo for a "Dangerfile.js" and will run Danger against that.  
* When an event `"issue"` comes in, then `danger/issues.js` will run.

All other events are ignored. You can do a bit more with these rules, see [the tests](/source/danger/_tests/_danger_run.test.ts).

You can find the rules inside the tables for both `"installations"` and `"github_repo"`. The installations are global rules that run everywhere, the github_repo rules are only applied on one repo.

That's really about it ATM, it's likely there are bugs here & there as this is just past proof of concept stage but not quite in production for any of Orta's projects.

## Code Overview

There are three files where the magic happens:

- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Running and coordinating a Dangerfile
- [source/githubevents/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/routing/router.ts](source/routing/router.ts) - Any unique work on GitHub events


This is a _just barely tested_ project, there's a lot in places where the code isn't going to change much.

### Using a Danger fork
If you want to also make changes to Danger JS, and use the local version to make changes

```
# from Peril
cd ..
git clone https://github.com/danger/danger-js.git
yarn install
yarn link danger

# Then start the file watcher in a new tab
yarn start build:watch

# Then in Peril again
cd ../Peril
yarn link danger
```

### Getting Webhooks locally from GitHub

1. Install [ngrok](https://ngrok.com/) and start it with `ngrok http 5000`. It will give you an address like `https://9cbc94d15.ngrok.io/`.

2. Create a GitHub Integration, you can go to your user account, then Integrations. As it's your own dev integration, you may as well just give yourself all the callbacks. If you want the exact access rights, see [the Danger page](https://github.com/integration/danger)

  * You should set up your **callback url** to be: https://9cbc94d15.ngrok.io/webhook

  * and your **webhook url** to be: https://9cbc94d15.ngrok.io/webhook

  * You will need your a copy of your private key, it will be used inside your `config/default.json` later.

3. Start your server, this will go on port 5000 - and be active over the web on your ngrok address.

4. You need to set up the Integration private key. Download it. Open it in a text editor. You need to get it formatted like the one inside [.env.sample](.env.sample).

5. Set up your own `.env` based on the example one.

6. OK, you're good to go.

7. Go the the integration page, and hit the "Install" button in the top left, then add it to a repo. This should start sending data to your server. You should see a `POST /webhook  200 OK` to indicate that it's set up in ngrok. You should see 

Your tools for working with this data are those webhook notifications on the GitHub integration page, re-send them when you want. You can also re-send them [from ngrok local](http://localhost:4040/inspect/http).


### Running it with Docker

Assuming that the Github Integration is already set up:

1. Set up your own `docker-compose.yml` based on the example one (see `docker-compose.sample.yml`).

2. Run `docker-compose up --build`. This will build the Peril service and launch the stack.

3. Go to `http://localhost:4040` to get the ngrok url.

4. Update your Github Integration **webhook url** and **callback url** with the new ngrok url

:whale:

### Developing with Docker

To develop peril inside a docker container, you can run `docker-compose up`. This will mount your project folder inside the peril container and run the `yarn start` command to run the service.

[postico]: https://eggerapps.at/postico/
[integration]: https://developer.github.com/early-access/integrations/
[48]: https://github.com/danger/peril/issues/48
