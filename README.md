### Peril

The centralized Danger server, freeing Danger from her CI confines.

Want to understand what the plan is? Consult the [VISION.md](/VISION.md) 

---

### I want to hack on Peril!

Ace, great, cool. So, it's a bit of a process. I'm not sure if this will get easier in time. It's a complex app.

### Setting up Peril

```sh
git clone https://github.com/danger/peril.git
cd peril
yarn install
```

You can then run the project with `yarn start`. I use VS Code to launch, and debug Peril. You should do that too.

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

### Getting Webhooks from GitHub

1. Install [ngrok](https://ngrok.com/) and start it with `ngrok http 5000`. It will give you an address like `https://9cbc94d15.ngrok.io/`.

2. Create a GitHub Integration, you can go to your user account, then Integrations. As it's your own dev integration, you may as well just give yourself all the callbacks. If you want the exact access rights, see [the Danger page](https://github.com/integration/danger)

  * You should set up your **callback url** to be: https://9cbc94d15.ngrok.io/webhook

  * and your **webhook url** to be: https://9cbc94d15.ngrok.io/webhook

  * You will need your a copy of your private key, it will be used inside your `config/default.json` later.

3. Make sure you have a mongodb running, I recommend [the app](http://gcollazo.github.io/mongodbapp/) and this [editor](https://robomongo.org). Make a db called `github_installations` and a collection called `github_integrations`. These will probably be changed in the future as they are bad names - sorry.

4. Start your server, this will go on port 5000 - and be active over the web on your ngrok address.

5. You need to set up the Integration private key. Download it. Open it in a text editor. You need to get it formatted like the one inside [default.json.example](/config/default.json.example).

6. Set up your own `default.json` based on the example one.

7. OK, you're good to go.

8. Go the the integration page, and hit the "Install" button in the top left, then add it to a repo. This should start sending data to your server. You should see a `POST /webhook  200 OK` to indicate that it's set up in ngrok. You should see 

Your tools for working with this data are those webhook notifications on the GitHub integration page, re-send them when you want. You can also re-send them [from ngrok local](http://localhost:4040/inspect/http).
