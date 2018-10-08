/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
require('dotenv').config();
const path = require('path'),
  _ = require('lodash'),
  URL = require('url').URL,
  nem = require('nem-sdk').default,
  mongoose = require('mongoose');

const getDefault = () => {
  return (
    (process.env.NIS || 'http://192.3.61.243:7890') + '@' +
    (process.env.WEBSOCKET_NIS || 'http://192.3.61.243:7778')
  );
};

const createConfigProviders = (providers) => {
  return _.chain(providers)
    .split(',')
    .map(provider => {
      const data = provider.split('@');
      return {
        http: data[0].trim(),
        ws: data[1].trim()
      };
    })
    .value();
};
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

const providers = createConfigProviders(process.env.PROVIDERS || getDefault()),
  nemUrl = new URL(providers[0].http),
  nemWebsocketUrl = new URL(providers[0].ws),
  accountPrefix = process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem',
  profilePrefix = process.env.MONGO_PROFILE_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem',
  collectionPrefix = process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'nem',
  node = {
    network: parseInt(process.env.NETWORK) || -104,
    networkName: process.env.NETWORK_NAME || 'testnet',
    providers: createConfigProviders(process.env.PROVIDERS || getDefault())
  },
  rabbit = {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_nem'
  };



let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: accountPrefix
    },
    profile: {
      uri: process.env.MONGO_PROFILE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: profilePrefix
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix,
      useData: parseInt(process.env.USE_MONGO_DATA) || 1
    }
  },
  node,
  rabbit,
  systemRabbit: {
    url: process.env.SYSTEM_RABBIT_URI || process.env.RABBIT_URI || 'amqp://localhost:5672',
    exchange: process.env.SYSTEM_RABBIT_EXCHANGE || 'internal',
    serviceName: process.env.SYSTEM_RABBIT_SERVICE_NAME || 'system' 
  },
  checkSystem: process.env.CHECK_SYSTEM ? parseInt(process.env.CHECK_SYSTEM) : true,
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.NODE_RED_MONGO_COLLECTION_PREFIX || '',
    },
    logging: {
      console: {
        level: process.env.LOG_LEVEL || 'info'
      }
    },
    migrationsDir: path.join(__dirname, '../migrations'),
    useLocalStorage: false,
    migrationsInOneFile: true,
    httpAdminRoot: process.env.HTTP_ADMIN || false,
    autoSyncMigrations: _.isString(process.env.NODERED_AUTO_SYNC_MIGRATIONS) ? parseInt(process.env.NODERED_AUTO_SYNC_MIGRATIONS) : true,
    functionGlobalContext: {
      connections: {
        primary: mongoose
      },
      settings: {
        mongo: {
          accountPrefix,
          collectionPrefix
        },
        rabbit,
        nem: {
          endpoint: nem.model.objects.create('endpoint')(`${nemUrl.protocol}//${nemUrl.hostname}`, nemUrl.port),
          websocketEndpoint: nem.model.objects.create('endpoint')(`${nemWebsocketUrl.protocol}//${nemWebsocketUrl.hostname}`, nemWebsocketUrl.port),
          lib: nem
        },
        node,
        laborx: {
          url: process.env.LABORX_RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
          authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
          profileModel: profilePrefix + 'Profile',
          useAuth: process.env.LABORX_USE_AUTH ? parseInt(process.env.LABORX_USE_AUTH) : false,
          useCache: process.env.LABORX_USE_CACHE ? parseInt(process.env.LABORX_USE_CACHE) : true,
          dbAlias: 'profile'
        }
      }
    }
  }
};

module.exports = config;

