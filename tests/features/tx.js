/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  generateAddress = require('../utils/address/generateAddress');


module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:hash when no tx in db - get {}', async () => {
    const response = await request(`${config.dev.url}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:hash with non exist hash - get {}', async () => {
    const hash = 'TESTHASH';
    const address = generateAddress();
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${config.dev.url}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:hash with exist hash (in db two txs) - get right tx', async () => {
    const hash = 'TESTHASH2';
    const address = generateAddress();
    const tx = await models.txModel.findOneAndUpdate({'_id': hash}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});
  
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${config.dev.url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);

    expect(response).to.deep.equal({
      'recipient':address,
      'mosaics':[],
      'blockNumber': tx.blockNumber,
      'hash': hash,
      'timeStamp': tx.timestamp
    });
  });



  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress();
    const response = await request(`${config.dev.url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress();
    const response = await request(`${config.dev.url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const address = generateAddress(),
        secondAddress = generateAddress();
    const txs = [];
    txs[0] = await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: secondAddress,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    txs[1] = await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      recipient: address,
      timestamp: 2,
      blockNumber: 7
    }, {upsert: true});


    const response = await request(`${config.dev.url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response.length).to.equal(2);
    expect(response).to.deep.equal([
      {
        recipient: address,
        mosaics: [],
        blockNumber: 7,
        hash: 'TEST2',
        timeStamp: 2 
      }, { 
        recipient: address,
        mosaics: [],
        blockNumber: 5,
        hash: 'TEST1',
        timeStamp: 1 
      }
    ]);
  });

};
