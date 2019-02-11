## Peril Runner

This folder is Peril's Dangerfile runtime. Its packages are exactly what the Peril AWS layer uses for your Dangerfiles
with, and so can reliably be used in a peril-settings repo.

The package.json is a mix of human curated `devDependencies` and human generated `dependencies` (via
[`../api/source/scripts/generate-runner-deps.ts][]).

## TODO

- Babel setup
