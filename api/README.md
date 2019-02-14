## How does Peril work?

<img src="https://github.com/danger/peril/raw/master/docs/images/peril-setup.png">

There are some key files where the magic happens:

- [source/routing/router.ts](source/routing/router.ts) - Decide what work to with GitHub events
- [source/github/events/github_runner.ts](source/github/events/github_runner.ts) - Figuring out what Dangerfiles to run
- [source/danger/danger_runner.ts](source/danger/danger_runner.ts) - Coordinating running the Dangerfiles
- [source/runner/run.ts](source/runner/run.ts) - Run the Dangerfile in a sandbox

This is a _reasonably tested_ project, there's a lot in places where the code isn't going to change much now so they're
slowly getting covered.

### Deployment

- [staging](../docs/using_peril_staging.md)

Peril is split into two things:

- The API

  - Deploy: `yarn deploy:staging`
  - Logs: `yarn logs:staging`

- The Runner

  The runner is an AWS lambda, it has two parts. An
  [AWS Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) which is the Peril runtime. Then a
  function per-org which triggers the layer.

  ### Layer

  - Setup the out folder:

    - `scripts/build-and-update-runner.sh`

  - Deploy to AWS:

    - `aws lambda publish-layer-version --layer-name peril-staging-runtime --zip-file fileb://runner.zip --profile peril`
    - `rm runner.zip`

    Note: Updating the layer won't be enough, you'll need up tell functions to use the new layer version.

  ### Function

  Take the runner index.js, zip it and ship it

  - `zip function.zip ../runner/index.js -j`
  - `aws lambda update-function-code --function-name peril-s-danger-1234 --zip-file fileb://function.zip --profile peril`
  - `aws lambda update-function-configuration --function-name peril-s-danger-1234 --layers arn:aws:lambda:us-east-1:656992703780:layer:peril-staging-runtime:1 --profile peril`

  Then you can test evaluation:

  - `aws lambda invoke --function-name peril-s-danger-1234 dist/output.log --profile peril`

  Docs:

  - Layers: https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/layers
  - Functions: https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions
