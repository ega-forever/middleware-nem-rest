/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  Promise = require('bluebird'),
  generateAddress = require('../utils/address/generateAddress');

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.txModel.remove({});
  });


  it('POST /addr - response with addr', async () => {
    const address = generateAddress();

    const response = await request(`${config.dev.url}/addr`, {
      method: 'POST',
      json: {address}
    });
    expect(response.address).to.equal(address);
  });

  it('POST /addr -  rabbitmq message account.create with addr', async () => {
    const address = generateAddress();
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.create`);

    await Promise.all([
      (async () => {
        await request(`${config.dev.url}/addr`, {
          method: 'POST',
          json: {address}
        });
      })(),
      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', async msg => {
          if (!msg)
            return;

          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          res();
        }));
      })()
    ]);
    await ctx.amqp.channel.deleteQueue('test_addr');

  });

  it('POST /addr with exist addr - get response', async () => {
    const address = generateAddress('test');
    const response = await request(`${config.dev.url}/addr`, {
      method: 'POST',
      json: {address}
    });
    expect(response.address).to.equal(address);
  });


  it('send message address.created from laborx - get events message account.created after account in mongo', async () => {
    const address = generateAddress();
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.created`);
    await Promise.all([
      (async () => {
        const data = {'nem-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),
      (async () => {
        await new Promise(res =>
          ctx.amqp.channel.consume('test_addr', async msg => {

            if (!msg)
              return;

            const content = JSON.parse(msg.content);
            if (content.address !== address)
                return;
            expect(content.address).to.equal(address);
            res();
          })
        );
        await ctx.amqp.channel.deleteQueue('test_addr');

        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })()
    ]);
  });

  it('send message address.created from laborx - get internal message user.created after account in mongo', async () => {
    const address = generateAddress();
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', 
      {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', 
      `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {'nem-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', 
          new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');
        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })()
    ]);
  });

  it('send message address.created from laborx with exist addr - get messages user.created, account.created with account in mongo', async () => {
    const address = generateAddress();
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'internal', `${config.rabbit.serviceName}_user.created`);
    
    await ctx.amqp.channel.assertQueue('test_addr2', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr2', 'events', `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {'nem-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),
      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');
        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr2', async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr2');
        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })()
    ]);
  });



  it('send event message account.create  - get events message account.created after account in mongo', async () => {
    const address = generateAddress();
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');

        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })()
    ]);
  });

  it('send event message account.create  - get internal message user.created after account in mongo', async () => {
    const address = generateAddress();
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'internal', `${config.rabbit.serviceName}_user.created`);
    
    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address != address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');

        const isExist = await models.accountModel.count({address});
        expect(!!isExist).to.equal(true);
      })()
    ]);
  });

  it('send message address.deleted from laborx - get events message account.deleted after account deleted in mongo', async () => {
    const address = generateAddress();
    await models.accountModel.create({address});
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
    
    await Promise.all([
      (async () => {
        const data = {'nem-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');

        const isExists = await models.accountModel.count({address});
        expect(!!isExists).to.equal(true);
      })()
    ]);
  });


  it('send message address.deleted from laborx about not exist addr - get account.deleted event', async () => {
    const address = generateAddress('test4');
    
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
   

    await Promise.all([
      (async () => {
        const data = {'nem-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  async msg => {

          if(!msg)
            return;

          const content = JSON.parse(msg.content);
          if (content.address !== address)
            return;
          expect(content.address).to.equal(address);
          res();
        }));
        await ctx.amqp.channel.deleteQueue('test_addr');
        const account = await models.accountModel.findOne({address});
        expect(account).to.be.null;
      })()
    ]);
  });

  it('GET /addr/:addr/balance - and get response with balance', async () => {
    const address = generateAddress('test7');
    await models.accountModel.create({address});
    

    const response = await request(`${config.dev.url}/addr/${address}/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`,
      },
      json: true
    });
    expect(response).to.deep.equal({
      balance: 
      {
        confirmed: { value: '0', amount: '0.000000' },
        unconfirmed: { value: '0', amount: '0.000000' },
        vested: { value: '0', amount: '0.000000' } 
      },
      mosaics: {}
    });

  });

  it('GET /addr/:addr/balance - and get response with balance and mosaics', async () => {
    const address = generateAddress('test7');
    

    await models.accountModel.create({address,
      balance: {
        confirmed: 300*1000000,
        unconfirmed: 500*1000000,
        vested: 200*1000000
      },
      mosaics: {
        abba: {
          confirmed: 300*10,
          unconfirmed: 500*10,
          decimals: 2
        },
        bart: {
          confirmed: 300,
          unconfirmed: 500,
          decimals: 1
        }
      }
    });


    const response = await request(`${config.dev.url}/addr/${address}/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`,
      },
      json: true
    });
    expect(response).to.deep.equal({
      balance: {
        confirmed: { value: '300000000', amount: '300.000000' },
        unconfirmed: { value: '500000000', amount: '500.000000' },
        vested: { value: '200000000', amount: '200.000000' } 
      },
      mosaics: {
        abba: {
          confirmed: { value: 3000, amount: 30},
          unconfirmed: { value: 5000, amount: 50},
          decimals: 2
        },
        bart: {
          confirmed: { value: 300, amount: 30},
          unconfirmed: { value: 500, amount: 50},
          decimals: 1
        }
      }
    });

  });


};
