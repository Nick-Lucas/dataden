# Setup Guide

## Installation

DataDen has as few external dependencies as possible, but some initial setup is required.

* Install [Node.JS v10+ or higher](https://nodejs.org/en/download/)
* [Install MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials) 
  * Get your connection string for later, ie. `mongodb://username:password@localhost:port?retryWrites=true&w=majority`
* `npm install -g @dataden/core` or `yarn global add @dataden/core`


## Configuration

* Create and populate your global config file:
  ```json
  // ~/.dataden.json

  {
    "MONGO_URI": "add your mongodb connection string here",
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
