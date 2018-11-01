const env = {
  MONGO_URI: 'mongodb://middleware-testnet:ChR0mOn1T6@middleware-nem-db-mongodb.middleware:27017/testnet-nem-middleware-chronobank-io',
  MONGO_COLLECTION_PREFIX: 'nem',
  RABBIT_URI: 'amqp://rabbit:nC865xfpbU41@rabbitmq-rabbitmq-svc.default:5672',
  RABBIT_SERVICE_NAME: 'testnet-nem-middleware-chronobank-io',
  NETWORK: '-104',
  PROVIDERS: 'http://nis-testnet.default:7890@tcp://nis-testnet-node.default:7778',
  REST_PORT: 8080
};
const env_develop = {
  MONGO_URI: 'mongodb://middleware-testnet:ChR0mOn1T6@middleware-nem-db-mongodb.middleware:27017/testnet-nem-middleware-chronobank-io',
  MONGO_COLLECTION_PREFIX: 'nem',
  RABBIT_URI: 'amqp://rabbit:nC865xfpbU41@rabbitmq-rabbitmq-svc.default:5672',
  RABBIT_SERVICE_NAME: 'testnet-nem-middleware-chronobank-io',
  NETWORK: '-104',
  PROVIDERS: 'http://nis-testnet.default:7890@tcp://nis-testnet-node.default:7778',
  REST_PORT: 8080
};
const env_stage = {
  MONGO_URI: 'mongodb://middleware-testnet:ChR0mOn1T6@middleware-nem-db-mongodb.middleware:27017/testnet-nem-middleware-chronobank-io',
  MONGO_COLLECTION_PREFIX: 'nem',
  RABBIT_URI: 'amqp://rabbit:nC865xfpbU41@rabbitmq-rabbitmq-svc.default:5672',
  RABBIT_SERVICE_NAME: 'testnet-nem-middleware-chronobank-io',
  NETWORK: '-104',
  PROVIDERS: 'http://nis-testnet.default:7890@tcp://nis-testnet-node.default:7778',
  REST_PORT: 8080
};
const env_prod = {
  MONGO_URI: 'mongodb://middleware-testnet:ChR0mOn1T6@middleware-nem-db-mongodb.middleware:27017/mainnet-nem-middleware-chronobank-io',
  MONGO_COLLECTION_PREFIX: 'nem',
  RABBIT_URI: 'amqp://rabbit:nC865xfpbU41@rabbitmq-rabbitmq-svc.default:5672',
  RABBIT_SERVICE_NAME: 'mainnet-nem-middleware-chronobank-io',
  NETWORK: '104',
  PROVIDERS: 'http://nis-mainnet.default:7890@tcp://nis-mainnet-node.default:7778',
  REST_PORT: 8080
};

module.exports = {
 apps: [
   {
     name: 'middleware-nem-rest',
     script: './index.js',
     watch: true,
     disable_trace: false,
     env: env_develop,
     env_production: env_prod,
     env_develop: env_develop,
     env_stage: env_stage
   }
 ]
}
