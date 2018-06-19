/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/

const _ = require('lodash'),
  Provider = require('../models/provider');

class ProviderService {
  constructor (channel, configProviders, rabbitPrefix) {
    this.channel = channel;
    this.providers = this.createProviders(configProviders);
    this.rabbitPrefix = rabbitPrefix;
  }


  createProviders (configProviders) {
    return _.map(configProviders, (configProvider, key) => {
      return new Provider(configProvider.key, configProvider.ws, configProvider.http, 0);
    });
  }

  /**
   * 
   * 
   * @returns {Promise return Provider}
   * 
   * @memberOf ProviderService
   */
  async getProvider () {
    if (this._provider === undefined)
      await this.selectProvider();
    return this._provider;
  }

  async sendWhatProviderEvent () {
    await this.channel.publish('events', `${this.rabbitPrefix}_what_provider`, new Buffer('what'));
  }

  /**
   * @memberOf ProviderService
   */
  async start () {
    await this.channel.assertQueue(`${this.rabbitPrefix}_rest_provider`, {autoDelete: true});
    await this.channel.bindQueue(`${this.rabbitPrefix}_rest_provider`, 'events', `${this.rabbitPrefix}_provider`);
    this.channel.consume(`${this.rabbitPrefix}_rest_provider`, async (message) => {
      this._provider = this.chooseProvider(message.content.toString()); 
    }, {noAck: true});
  }

  chooseProvider (key) {
    if (!this.providers[key]) 
      throw new Error('not found provider for key from block_processor[through rabbit mq] key = ' + key);
    return this.providers[key];
  }

  /**
   * 
   * @memberOf ProviderService
   */
  async selectProvider () {
    await this.sendWhatProviderEvent();
    await this.checkOnWhat();
  }

  async checkOnWhat () {
    await this.channel.assertQueue(`${this.rabbitPrefix}_rest_check_what_provider`, {autoDelete: true, durable: false});
    await this.channel.bindQueue(`${this.rabbitPrefix}_rest_check_what_provider`, 'events', `${this.rabbitPrefix}_provider`);
    this.channel.consume(`${this.rabbitPrefix}_rest_check_what_provider`, async (message) => {
      this._provider = this.chooseProvider(message.content.toString()); 
      await this.channel.cancel(message.fields.consumerTag);
    }, {noAck: true});
  }

}

module.exports = ProviderService;
