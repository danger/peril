# What is the setup for Peril staging?

## There is a [PerilTest GitHub org](https://github.com/PerilTest/PerilPRTester)

It has a few sandbox repos.

### There is a staging GitHub integration

[Peril Staging](https://github.com/organizations/PerilTest/settings/integrations/peril-staging) only runs against repos in the [PerilTest org](https://github.com/PerilTest), and others cannot run it. The integration's `id` is `1839`, it's key is in my personal 1password.

### There is a heroku instance

- https://peril-staging.herokuapp.com

It uses the postgres database method to hold its data. 

At some point, I'd like to also install a heroku version.
