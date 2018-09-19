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
  
  AmqpService = require('middleware-common-infrastructure/AmqpService'),
  InfrastructureInfo = require('middleware-common-infrastructure/InfrastructureInfo'),
  InfrastructureService = require('middleware-common-infrastructure/InfrastructureService'),
  
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

const runInfrastucture = async function () {
  const rabbit = new AmqpService(
    config.infrastructureRabbit.url, 
    config.infrastructureRabbit.exchange,
    config.infrastructureRabbit.serviceName
  );
  const info = InfrastructureInfo(require('./package.json'));
  const infrastructure = new InfrastructureService(info, rabbit, {checkInterval: 10000});
  await infrastructure.start();
  infrastructure.on(infrastructure.REQUIREMENT_ERROR, ({requirement, version}) => {
    log.error(`Not found requirement with name ${requirement.name} version=${requirement.version}.` +
        ` Last version of this middleware=${version}`);
    process.exit(1);
  });
  await infrastructure.checkRequirements();
  infrastructure.periodicallyCheck();
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

  if (config.checkInfrastructure)
    await runInfrastucture();

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
