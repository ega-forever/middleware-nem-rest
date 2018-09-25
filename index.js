/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const config = require('./config'),
  mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: 'core.rest', level: config.nodered.logging.console.level}),
  path = require('path'),
  
  AmqpService = require('middleware_common_infrastructure/AmqpService'),
  InfrastructureInfo = require('middleware_common_infrastructure/InfrastructureInfo'),
  InfrastructureService = require('middleware_common_infrastructure/InfrastructureService'),
  
  _ = require('lodash'),
  models = require('./models'),
  migrator = require('middleware_service.sdk').migrator,
  redInitter = require('middleware_service.sdk').init;

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */


mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri, {useMongoClient: true});
mongoose.profile = mongoose.createConnection(config.mongo.profile.uri, {useMongoClient: true});
mongoose.data = mongoose.createConnection(config.mongo.data.uri, {useMongoClient: true});

const runSystem = async function () {
  const rabbit = new AmqpService(
    config.systemRabbit.url, 
    config.systemRabbit.exchange,
    config.systemRabbit.serviceName
  );
  const info = new InfrastructureInfo(require('./package.json'));
  const system = new InfrastructureService(info, rabbit, {checkInterval: 10000});
  await system.start();
  system.on(system.REQUIREMENT_ERROR, (requirement, version) => {
    log.error(`Not found requirement with name ${requirement.name} version=${requirement.version}.` +
        ` Last version of this middleware=${version}`);
    process.exit(1);
  });
  await system.checkRequirements();
  system.periodicallyCheck();
};

_.chain([mongoose.accounts, mongoose.data, mongoose.profile])
  .compact().forEach(connection =>
    connection.on('disconnected', function () {
      log.error('mongo disconnected!');
      process.exit(0);
    })
  ).value();

models.init();


const init = async () => {
  if (config.checkSystem)
    await runSystem();

  if (config.nodered.autoSyncMigrations)
    await migrator.run(
      config,
      path.join(__dirname, 'migrations')
    );

  redInitter(config);

};

module.exports = init().catch((e) => {
  log.error(e);
  process.exit(1);
});
