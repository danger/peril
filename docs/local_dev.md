### Setting up to work on Peril

```sh
git clone https://github.com/danger/peril.git
cd peril
yarn install
```

Peril is a TypeScript project, so I'd recommend using VS Code. The project is pretty well tested now, so it's very possible that to make the changes you want you can just do it in the tests to verify.

However, if you would like a full setup for local development:

You can then run the project with `yarn start`. For running on your server, you're going to need: 

* A GitHub App
* ngrok (see below)

You should create a new GitHub org, and go through [Setup for Org](setup_for_org.md) so that you have some existing events 
to work with. Then change the webhook urls to refer to your ngrok local dev environment.  You'll need to copy all of the 
ENV vars too.

---

So, you got the server up and running, now you need to install your GitHub integration in your org. 
If you've already done this, you can go into your integration admin panel and re-send the event, or re-install.

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


### Getting Webhooks locally from GitHub

1. Install [ngrok](https://ngrok.com/) and start it with `ngrok http 5000`. It will give you an address like `https://9cbc94d15.ngrok.io/`.

2. Create a GitHub Integration, you can go to your user account, then Integrations. As it's your own dev integration, you may as well just give yourself all the callbacks. If you want the exact access rights, see [the Danger page](https://github.com/integration/danger)

  * Set your **webhook url** to be: https://9cbc94d15.ngrok.io/webhook

  * You will need your a copy of your private key, it will be used inside your `.env` later.

3. Start your server, this will go on port 5000 - and be active over the web on your ngrok address.

5. Set up your own `.env` based on the example one with your org's settings.

6. OK, you're good to go.

7. Go the the integration page, and hit the "Install" button in the top left, then add it to a repo. This should start sending data to your server. You should see a `POST /webhook  200 OK` to indicate that it's set up in ngrok. You should see 

Your tools for working with this data are those webhook notifications on the GitHub App's "advanced" page, re-send events to iterate on your code. You can also re-send them [from ngrok local](http://localhost:4040/inspect/http).

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

### Running it with Docker

Assuming that the GitHub Integration is already set up:

1. Set up your own `docker-compose.yml` based on the example one (see `docker-compose.sample.yml`).

2. Run `docker-compose up --build`. This will build the Peril service and launch the stack.

3. Go to `http://localhost:4040` to get the ngrok url.

4. Update your GitHub Integration **webhook url** and **callback url** with the new ngrok url.

:whale:

### Developing with Docker

To develop peril inside a docker container, you can run `docker-compose up`. This will mount your project folder inside the peril container and run the `yarn start` command to run the service.

[postico]: https://eggerapps.at/postico/
[48]: https://github.com/danger/peril/issues/48

