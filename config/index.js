require('dotenv').config();
const path = require('path'),
  bunyan = require('bunyan'),
  util = require('util'),
  nem = require('nem-sdk').default,
  URL = require('url').URL,
  nemUrl = new URL(process.env.NIS || 'http://23.228.67.85:7890'),
  log = bunyan.createLogger({name: 'core.rest'});

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

module.exports = {
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/data',
    collectionPrefix: process.env.MONGO_COLLECTION_PREFIX || 'nem'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data'
    },
    autoSyncMigrations: process.env.NODERED_AUTO_SYNC_MIGRATIONS || true,
    httpAdminRoot: '/admin',
    httpNodeRoot: '/',
    debugMaxLength: 1000,
    adminAuth: require('../controllers/nodeRedAuthController'),
    nodesDir: path.join(__dirname, '../'),
    autoInstallModules: true,
    functionGlobalContext: {
      _: require('lodash'),
      nem: {
        endpoint: nem.model.objects.create('endpoint')(`${nemUrl.protocol}//${nemUrl.hostname}`, nemUrl.port),
        lib: nem
      },
      factories: {
        messages: {
          address: require('../factories/messages/addressMessageFactory'),
          generic: require('../factories/messages/genericMessageFactory'),
          tx: require('../factories/messages/txMessageFactory')
        }
      }
    },
    storageModule: require('../controllers/nodeRedStorageController'),
    logging: {
      console: {
        level: 'info',
        metrics: true,
        handler: () =>
          (msg) => {
            log.info(util.inspect(msg, null, 3));
          }
      }
    }
  }
};
