## Peril Runner

This folder is Peril's Dangerfile runtime. Its packages are exactly what the Peril AWS layer uses for your Dangerfiles
with, and so can reliably be used in a peril-settings repo.

The package.json is a mix of human curated `devDependencies` and human generated `dependencies` (via
[`../api/source/scripts/generate-runner-deps.ts][]).

## Aim

Bootstrap Peril's runtime, and run the peril runner.

This needs to be _really_ small, so, avoid use node_modules in here as the function zip ends up in memory in Peril.

## TODO

- Files for Babel setup
