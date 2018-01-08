require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config'),
  mongoose = require('mongoose'),
  expect = require('chai').expect,
  _ = require('lodash'),
  accountModel = require('../models/accountModel'),
  Promise = require('bluebird'),
  request = require('request'),
  ctx = {
  address: 'TDEK3DOKN54XWEVUNXJOLWDJMYEF2G7HPK2LRU5W'
  };

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  after(() => {
    return mongoose.disconnect();
  });

  it('add new account', async () =>
    await new accountModel({
      address: ctx.address,
      balance: 10000000
    })
      .save()
  );

  it('validate balance', async () => {
    await new Promise(res => {
      request({
        url: `http://localhost:${config.rest.port}/addr/${ctx.address}/balance`,
        method: 'GET',
        json: true,
      }, (err, resp) => {
        expect(resp.body.balance).to.include({value: 10000000, amount: '10.000000'});
        res();
      })
    });
  });

});
