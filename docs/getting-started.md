# Setup Guide

## Installation

DataDen has as few external dependencies as possible, but some initial setup is required.

### Hardware & OS

DataDen is design to be installed on small but somewhat powerful devices. The spec is up to you but bear some things in mind:

* MongoDB only support 64bit architecture, so  make sure you use hardware and  an operating system which provides this
* Raspberry Pi OS (at time of writing) is 32bit only, so you will need to select a different flavour of Linux as [described here](https://developer.mongodb.com/how-to/mongodb-on-raspberry-pi/)

### Software Dependencies

* Install [Node.JS v10+ or higher](https://nodejs.org/en/download/)
* [Install and configure MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials) 
  * for Raspberry Pi you [will want these instructions](https://developer.mongodb.com/how-to/mongodb-on-raspberry-pi/)
  * Get your connection string for later, ie. `mongodb://username:password@127.0.0.1:27017?retryWrites=true&w=majority`
* `npm install -g @dataden/core` or `yarn global add @dataden/core`
  * If your get an npm access permission error on linux, [check this guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)


## Configuration

* Create and populate your global config file:
  ```json
  // ~/.dataden.json

  {
    "MONGO_URI": "mongodb://username:password@127.0.0.1:27017?retryWrites=true&w=majority",
    "LOG_LEVEL": "info"
  }
  ```
* Run `dataden-daemon start`
  * `dataden-daemon logs` to check for any errors
  * `dataden-daemon --help` for other commands
* DataDen will now be running on port `8800` (or the next available port if not available, check the logs to find out)

## Using DataDen

* Open your browser and navigate to `https://localhost:8800`, if hosting on another computer then replace localhost with the IP address of that computer.
* From the UI your can install and configure plugins to capture your data
