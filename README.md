# middleware-nem-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-nem-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-nem-rest)

Middleware service for which expose rest api

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://www.npmjs.com/package/chronobank-middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for interaction with middleware. This happens through the layer, which is built on node-red.
So, you don't need to write any code - you can create your own flow with UI tool supplied by node-red itself. Access by this route:
```
/admin
````


### Migrations
Migrations includes the predefined users for node-red (in order to access /admin route), and already predefined flows.
In order to apply migrations, type:
```
npm run migrate_red
```
The migrator wil look for the mongo_db connection string in ecosystem.config.js, in .env or from args. In case, you want run migrator with argument, you can do it like so:
```
npm run migrate_red mongodb://localhost:27017/data
```

#### Predefined Routes with node-red flows


The available routes are listed below:

| route | methods | params | description |
| ------ | ------ | ------ | ------ |
| /addr   | POST | ``` {address: <string>} ``` | register new address on middleware.
| /addr   | DELETE | ``` {address: <string>} ``` | remove an address from middleware
| /addr/{address}/balance   | GET |  | retrieve balance of the registered address


##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:27017/data
REST_PORT=8081
NETWORK=development
NODERED_MONGO_URI=mongodb://localhost:27018/data
NODERED_AUTO_SYNC_MIGRATIONS=true
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| REST_PORT   | rest plugin port
| NETWORK   | network name (alias)- is used for connecting via ipc (see block processor section)
| NODERED_MONGO_URI   | the URI string for mongo collection for keeping node-red users and flows (optional, if omitted - then default MONGO_URI will be used)
| NODERED_AUTO_SYNC_MIGRATIONS   | autosync migrations on start (default = yes)

License
----

MIT