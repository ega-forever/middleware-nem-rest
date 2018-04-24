/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('./config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  expect = require('chai').expect,
  _ = require('lodash');


mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.data = mongoose.createConnection(config.mongo.data.uri);

const txModel = require('../models/txModel'),
  accountModel = require('../models/accountModel'),
  clearQueues = require('./helpers/clearQueues'),
  connectToQueue = require('./helpers/connectToQueue'),
  consumeMessages = require('./helpers/consumeMessages'),
  saveAccountForAddress = require('./helpers/saveAccountForAddress'),
  getAccountFromMongo = require('./helpers/getAccountFromMongo'),
  request = require('request'),
  amqp = require('amqplib');

let accounts, amqpInstance;

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  before(async () => {
    await txModel.remove();
    await accountModel.remove();
    amqpInstance = await amqp.connect(config.rabbit.url);

    accounts = config.dev.accounts;
    await saveAccountForAddress(accounts[0]);
    await clearQueues(amqpInstance);
  });

  after(async () => {
    return mongoose.disconnect();
  });

  afterEach(async () => {
    await clearQueues(amqpInstance);
  });

  it('address/create from post request', async () => {
    const newAddress = `${_.chain(new Array(40)).map(() => _.random(0, 9)).map().join('').value()}`;
    accounts.push(newAddress);

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/`,
        method: 'POST',
        json: {address: newAddress}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err || resp);
        const account = await getAccountFromMongo(newAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.true;
        expect(account.balance.confirmed.toNumber()).be.equal(0);
        res();
      });
    });
  });

  it('address/create from rabbit mq', async () => {
    const newAddress = `${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`;
    accounts.push(newAddress);    

    const channel = await amqpInstance.createChannel();
    await Promise.all([
      (async () => {
 
        const info = {address: newAddress};
        await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(info)));
    
        await Promise.delay(8000);
    
        const account = await getAccountFromMongo(newAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.true;
        expect(account.balance.confirmed.toNumber()).to.be.equal(0);
      })(),
      (async () => {
        await connectToQueue(channel, `${config.rabbit.serviceName}.account.created`);
        await consumeMessages(1, channel, (message) => {
          const content = JSON.parse(message.content);
          if (content.address === newAddress) 
            return true;
          return false;
        });
      })()
    ]);
  });

  it('address/update balance address by amqp', async () => {
    const channel = await amqpInstance.createChannel();
    const info = {address: accounts[0]};
    await channel.publish('events', `${config.rabbit.serviceName}.account.balance`, new Buffer(JSON.stringify(info)));

    await Promise.delay(3000);

    const account = await getAccountFromMongo(accounts[0]);
    expect(account).not.to.be.null;
    expect(account.balance.confirmed.toNumber()).to.be.not.undefined;
  });

  it('address/remove by rest', async () => {
    const removeAddress = _.pullAt(accounts, accounts.length-1)[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/`,
        method: 'DELETE',
        json: {address: removeAddress}
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200)
          return rej(err || resp);
        
        const account = await getAccountFromMongo(removeAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.false;
        res();
      });
    });
  });

  it('address/remove from rabbit mq', async () => {
    const removeAddress = _.pullAt(accounts, accounts.length-1)[0];
    const acc = await saveAccountForAddress(removeAddress);   

    const channel = await amqpInstance.createChannel();
    await Promise.all([
      (async () => {
        const info = {address: removeAddress};
        await Promise.delay(6000);
        await channel.publish('events', `${config.rabbit.serviceName}.account.delete`, new Buffer(JSON.stringify(info)));
    
        await Promise.delay(6000);
    
        const account = await getAccountFromMongo(removeAddress);
        expect(account).not.to.be.null;
        expect(account.isActive).to.be.false;
      })(),
      (async () => {
        await connectToQueue(channel, `${config.rabbit.serviceName}.account.deleted`);
        return await consumeMessages(1, channel, (message) => {
          const content = JSON.parse(message.content);
          expect(content.address).to.be.equal(removeAddress);
          return true;
        });
      })()
    ]);
   });


 it('address/balance by rest', async () => {
    const address = accounts[0];

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${address}/balance`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err || resp);

        const body = JSON.parse(resp.body);
        expect(body.balance.confirmed.value).to.be.not.undefined;
        expect(body.mosaics).to.be.not.undefined;
        expect(body.mosaics).an('object').to.be.not.undefined;
        res();
      });
    });
  });

  let exampleTransactionHash;

  it('GET tx/:addr/history for some query params and one right transaction [0 => 1]', async () => {
    const txs = [{
      'recipient' : accounts[1],
      'type' : '257',
      'signer' : 'fa97f4fd052e40937180f72987189df429cc1f79996d439787cd13b76ff46caf',
      'sender' : accounts[0],
      'hash' : `${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`,
      'mosaics' : [],
      amount: 200,
      timeStamp: Date.now(),
      'blockNumber' : 1425994
    }, {
      'recipient' : 'TDFSDFSFSDFSDFSDFSDFSDFSDFSDFSDFS',
      'type' : '257',
      timeStamp: Date.now(),
      'signer' : 'fa97f4fd052e40937180f72987189df429cc1f79996d439787cd13b76ff46caf',
      'sender' : 'FDGDGDFGDFGDFGDFGDFGDFGDFGDFGD',
      'hash' : `${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`,
      'mosaics' : [],
      amount: 100,
      'blockNumber' : 1425994
    }];
    exampleTransactionHash = txs[0].hash;
    await new txModel(txs[0]).save();
    await new txModel(txs[1]).save();
    await Promise.delay(4000);

    const query = 'limit=1';

    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${accounts[0]}/history?${query}`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err || resp);

        try {
          expect(resp.body).to.not.be.empty;
          const body = JSON.parse(resp.body);
          expect(body).to.be.an('array').not.empty;

          const respTx = body[0];
          expect(respTx.recipient).to.equal(accounts[1]);
          expect(respTx.sender).to.equal(accounts[0]);
          expect(respTx.hash).to.equal(exampleTransactionHash);
          expect(respTx).to.contain.all.keys([
            'hash', 'blockNumber', 'timeStamp', 'amount']
          );
          res();            
        } catch (e) {
          rej(e || resp);
        }
      });
    });
  });


  it('GET tx/:addr/history for non exist', async () => {
    const address = 'LAAAAAAAAAAAAAAAALLL';



    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${address}/history`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err || resp);

        const body = JSON.parse(resp.body);
        expect(body).to.be.empty;
        res();
      });
    });
  });

  it('GET tx/:hash for transaction [0 => 1]', async () => {
    await new Promise((res, rej) => {
      request({
        url: `http://localhost:${config.rest.port}/tx/${exampleTransactionHash}`,
        method: 'GET',
      }, (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err || resp);

        const respTx = JSON.parse(resp.body);
        expect(respTx.recipient).to.equal(accounts[1]);
        expect(respTx.sender).to.equal(accounts[0]);
        expect(respTx).to.contain.all.keys([
          'hash', 'blockNumber', 'amount', 'timeStamp'
        ]);
        res();
      });
    });
  }); 


});

