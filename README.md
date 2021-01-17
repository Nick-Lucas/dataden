# dataden (working title)

Collect all your data into a personal data warehouse for cross-analysis and aggregation.

# Getting Started with your own DataDen

Follow the [Getting Started guide](./docs/getting-started.md)

# FAQ

#### I want to write a plugin

* Not much advice is available on this right now. `./packages/sdk` provides some interfaces to consume. More advice will be added later

#### I want my plugin to appear in the registry

* Open a pull request which adds it to `./meta/registry.json`. 
* Please set `verified` as false as we will set this ourselves once we have tested out and trust your plugin.

# Development

## Recommended Tools:

* NVM and nodejs
* docker and docker-compose - easily create a mongodb instance
* Yarn

## Running in development

* `/> yarn install`
* `/> yarn dev:start`
