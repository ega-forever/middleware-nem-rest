require('dotenv').config();

const mongoose = require('mongoose'),
  _ = require('lodash'),
  {URL} = require('url'),
  nem = require('nem-sdk').default;

module.exports = config => {

const nemUrl = new URL(config.node.providers[0].http),
    nemWebsocketUrl = new URL(config.node.providers[0].ws);



  return {
    connections: {
      primary: mongoose
    },
    settings: {
      mongo: {
        accountPrefix: config.mongo.accounts.collectionPrefix,
        collectionPrefix: config.mongo.data.collectionPrefix
      },
      rabbit: config.rabbit,
      laborx: {
        url: process.env.LABORX_RABBIT_URI || process.env.RABBIT_URI || 'amqp://localhost:5672',
        serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
        authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
        profileModel: config.mongo.data.collectionPrefix + 'Profile',
        useAuth: process.env.LABORX_USE_AUTH ? parseInt(process.env.LABORX_USE_AUTH) : false,
        useCache: process.env.LABORX_USE_CACHE ? parseInt(process.env.LABORX_USE_CACHE) : true,
        dbAlias: 'profile'
      }
    },
    node: config.node,
    nem: {
      endpoint: nem.model.objects.create('endpoint')(`${nemUrl.protocol}//${nemUrl.hostname}`, nemUrl.port),
      websocketEndpoint: nem.model.objects.create('endpoint')(`${nemWebsocketUrl.protocol}//${nemWebsocketUrl.hostname}`, nemWebsocketUrl.port),
      lib: nem
    }
  }

};