/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
require('dotenv').config();
const path = require('path'),
  nem = require('nem-sdk').default,
  URL = require('url').URL,
  _ = require('lodash'),
  mongoose = require('mongoose'),
  nemUrl = new URL(process.env.NIS || 'http://localhost:7890'),
  nemWebsocketUrl = new URL(process.env.WEBSOCKET_NIS || 'http://localhost:7880');

/**
 * @factory config
 * @description base app's configuration
 * @returns {{
 *    mongo: {
 *      uri: string,
 *      collectionPrefix: string
 *      },
 *    rest: {
 *      domain: string,
 *      port: number
 *      },
 *    node: {
 *      ipcName: string,
 *      ipcPath: string
 *      }
 *    }}
 */

let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem'
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem',
      useData: parseInt(process.env.USE_MONGO_DATA) || 1
    }
  },
  nis: {
    server: process.env.NIS || 'http://localhost:7890',
    network: parseInt(process.env.NETWORK) || -104,
  },
  rabbit: {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_nem'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data'
    },
    migrationsDir: path.join(__dirname, '../migrations'),
    migrationsInOneFile: true,
    httpAdminRoot: process.env.HTTP_ADMIN || false,
    autoSyncMigrations: _.isString(process.env.NODERED_AUTO_SYNC_MIGRATIONS) ? parseInt(process.env.NODERED_AUTO_SYNC_MIGRATIONS) : true,
    functionGlobalContext: {
      connections: {
        primary: mongoose
      },
      settings: {
        mongo: {
          accountPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem',
          collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem'
        },
        rabbit: {
          url: process.env.RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.RABBIT_SERVICE_NAME || 'app_nem'
        }
      },
      nem: {
        endpoint: nem.model.objects.create('endpoint')(`${nemUrl.protocol}//${nemUrl.hostname}`, nemUrl.port),
        websocketEndpoint: nem.model.objects.create('endpoint')(`${nemWebsocketUrl.protocol}//${nemWebsocketUrl.hostname}`, nemWebsocketUrl.port),
        network: process.env.NETWORK || -104,
        lib: nem
      },
    }
  }
};

module.exports = config;

