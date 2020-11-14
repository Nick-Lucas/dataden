# mydata (working title)

Collect all your data into a personal data warehouse for cross-analysis and aggregation.

# FAQ

#### I want to write a plugin

* Not much advice is available on this right now. `./packages/sdk` provides some interfaces to consume. More advice will be added later

#### I want my plugin to appear in the registry

* Open a pull request which adds it to `./meta/registry.json`. 
* Please set `verified` as false as we will set this ourselves once we have tested out and trust your plugin.

# Development

## Recommended Tools:

* NVM and nodejs
* docker and docker-compose - easily up a mongodb instance
* Yarn

## Running

* `/> yarn install`
* `/> yarn dev`
* `cd packages/core && yarn start`
