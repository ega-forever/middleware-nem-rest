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
  profileModel = require('../models/profileModel'),
  authRequest = require('./helpers/authRequest'),
  saveAccountForAddress = require('./helpers/saveAccountForAddress'),
  getAccountFromMongo = require('./helpers/getAccountFromMongo'),
  amqp = require('amqplib');

let accounts, amqpInstance;

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  before(async () => {
    await txModel.remove();
    await accountModel.remove();
    await profileModel.remove();
    amqpInstance = await amqp.connect(config.rabbit.url);

    accounts = config.dev.accounts;
    await saveAccountForAddress(accounts[0]);
    await clearQueues(amqpInstance);

    const channel = await amqpInstance.createChannel();
    await channel.assertExchange('profile', 'fanout', {durable: false});
  });

  after(async () => {
    return mongoose.disconnect();
  });

  afterEach(async () => {
    await clearQueues(amqpInstance);
  });

  it('address/create from rabbitmq (not nrm address) and check that all right', async () => {

    const newAddress = accounts[1];
    const channel = await amqpInstance.createChannel();
    const info = {'waves-address': newAddress, user: 1};
    await channel.publish('profile', 'address.created', new Buffer(JSON.stringify(info)));

    await Promise.delay(2000);
    const acc = await accountModel.findOne({address: newAddress});
    expect(acc).to.be.equal(null);
  });


  it('address/create from rabbitmq and check send event user.created in internal', async () => {

    const newAddress = accounts[1];
    await new Promise.all([
      (async () => {
        const channel = await amqpInstance.createChannel();
        const info = {'nem-address': newAddress, user: 1};
        await channel.publish('profile', 'address.created', new Buffer(JSON.stringify(info)));
      })(),
      (async () => {
        const channel = await amqpInstance.createChannel();
        await channel.assertExchange('internal', 'topic', {durable: false});
        const serviceName = config.nodered.functionGlobalContext.settings.rabbit.serviceName;
        await channel.assertQueue(`${serviceName}_test.user`);
        await channel.bindQueue(`${serviceName}_test.user`, 'internal', `${serviceName}_user.created`);
        channel.consume(`${serviceName}_test.user`, async (message) => {
          const content = JSON.parse(message.content);
          expect(content.address).to.be.equal(newAddress);
        }, {noAck: true});
    
        const acc = await accountModel.findOne({address: newAddress});
        expect(acc.address).to.be.equal(newAddress);
      })()
    ]);

  });

  it('address/delete from rabbitmq', async () => {

    const newAddress = accounts[1];
    const channel = await amqpInstance.createChannel();
    const info = {'nem-address': newAddress, user: 1};
    await channel.publish('profile', 'address.deleted', new Buffer(JSON.stringify(info)));

    await Promise.delay(2000);

    const acc = await accountModel.findOne({address: newAddress});
    expect(acc.isActive).to.be.equal(false);
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


 it('address/balance by rest', async () => {
    const address = accounts[0];

    await new Promise((res, rej) => {
      authRequest({
        url: `http://localhost:${config.rest.port}/addr/${address}/balance`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err);

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
      _id : `${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`,
      type : '257',
      signer : 'fa97f4fd052e40937180f72987189df429cc1f79996d439787cd13b76ff46caf',
      recipient : accounts[1],
      sender : accounts[0],
      mosaics : [],
      amount: 200,
      timestamp: Date.now(),
      blockNumber : 1425994
    }, {
      _id : `${_.chain(new Array(40)).map(() => _.random(0, 9)).join('').value()}`,
      recipient : 'TDFSDFSFSDFSDFSDFSDFSDFSDFSDFSDFS',
      type : '257',
      timestamp: Date.now(),
      signer : 'fa97f4fd052e40937180f72987189df429cc1f79996d439787cd13b76ff46caf',
      sender : 'FDGDGDFGDFGDFGDFGDFGDFGDFGDFGD',
      mosaics : [],
      amount: 100,
      blockNumber : 1425994
    }];
    exampleTransactionHash = txs[0]._id;
    await txModel.create(txs[0]);
    await txModel.create(txs[1]);

    const query = 'limit=1';

    await new Promise((res, rej) => {
      authRequest({
        url: `http://localhost:${config.rest.port}/tx/${accounts[0]}/history?${query}`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err);

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
          rej(e);
        }
      });
    });
  });


  it('GET tx/:addr/history for non exist', async () => {
    const address = 'LAAAAAAAAAAAAAAAALLL';



    await new Promise((res, rej) => {
      authRequest({
        url: `http://localhost:${config.rest.port}/tx/${address}/history`,
        method: 'GET',
      }, async (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err);

        const body = JSON.parse(resp.body);
        expect(body).to.be.empty;
        res();
      });
    });
  });

  it('GET tx/:hash for transaction [0 => 1]', async () => {
    await new Promise((res, rej) => {
      authRequest({
        url: `http://localhost:${config.rest.port}/tx/${exampleTransactionHash}`,
        method: 'GET',
      }, (err, resp) => {
        if (err || resp.statusCode !== 200) 
          return rej(err);

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

