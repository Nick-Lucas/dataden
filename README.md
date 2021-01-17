# DataDen

A plugable and extensible personal data warehouse, which gives you control of your own data, to use however you like.

* Ever wanted to bring together all your bank accounts, investment apps, pension providers, pay slips, and more, to get a full picture of your finances both now and historically?
* Ever wanted to bring together your stats from your online games and see a dashboard of all your activity?
* Ever wanted to collect any data from anywhere, to consume in any way you like?

DataDen gives you the tools to do this, using both community built and personally maintained plugins.

# Getting Started

To set up your own DataDen, follow the [Getting Started guide](./docs/getting-started.md)

# FAQ

#### I want to write a plugin

* Not much documentation exists for this right now, but simply:
  * `npm init` to start a new node project 
  * `npm install --save @dataden/sdk` adds the SDK, including a pre-configured build
  * Our [1st-party plugins make good example code](https://github.com/Nick-Lucas/dataden-plugins)

#### I want my plugin to appear in the registry

More documentation will be added on this later.

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
