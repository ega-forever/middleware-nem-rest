require('dotenv/config');

process.env.USE_MONGO_DATA = 1;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config'),
  Promise = require('bluebird'),
  mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);

const expect = require('chai').expect,
  _ = require('lodash'),
  accountModel = require('../models/accountModel'),
  nis = require('./services/nisRequestService'),
  request = require('request-promise'),
  ctx = {};

describe('core/rest', function () { //todo add integration tests for query, push tx, history and erc20tokens

  after(() => {
    return mongoose.disconnect();
  });

  /*  it('add new account', async () =>
   await new accountModel({
   address: ctx.address,
   balance: {
   confirmed: 10000000
   }
   })
   .save()
   );*/

  it('find first block with transactions', async () => {

    let findBlock = async (height) => {
      let block = await nis.getBlock(height);
      if (block.transactions.length === 0)
        return await findBlock(height + 1);

      let data = await Promise.map(block.transactions, async tx => {
        return await nis.getAccount(tx.recipient);
      });

      let account = _.chain(data)
        .find(item => _.get(item, 'account.balance') > 0)
        .get('account')
        .value();

      if (!account)
        return await findBlock(height + 1);

      return account;
    };

    let account = await findBlock(800);
    expect(account).to.have.property('address');
    ctx.account = account;
  });

  it('add account', async () => {
    let response = await request({
      url: `http://localhost:${config.rest.port}/addr`,
      method: 'POST',
      body: {
        address: ctx.account.address
      },
      json: true,
    });
    expect(response.code).to.equal(1);

  });

  it('validate balance', async () => {
    let response = await request({
        url: `http://localhost:${config.rest.port}/addr/${ctx.account.address}/balance`,
        method: 'GET',
        json: true,
      });
    expect(parseInt(response.balance.confirmed.value)).to.be.above(0);

  });

});
