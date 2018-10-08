/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const config = require('../config'),
  spawn = require('child_process').spawn,
  Promise = require('bluebird'),
  request = require('request-promise'),
  models = require('../../models'),
  expect = require('chai').expect,
  generateAddress = require('../utils/address/generateAddress'),
  authTests = require('./auth'),
  addressTests = require('./address');

module.exports = (ctx) => {

  before (async () => {
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });


  describe('auth', () => authTests(ctx));
  describe('address', () => addressTests(ctx));

  it('kill rest server and up already - work GET /tx/:hash', async () => {
    await ctx.restPid.kill();
    await Promise.delay(2000);
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);


    const hash = 'TESTHASH2';
    const toAddress = generateAddress();

    await models.txModel.update({'_id': hash}, {
      recipient: toAddress,
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
      'recipient': toAddress,
      'mosaics':[],
      'blockNumber': 5,
      'hash': hash,
      'timeStamp': 1
    });
  });

  after ('kill environment', async () => {
    await ctx.restPid.kill();
  });



};
