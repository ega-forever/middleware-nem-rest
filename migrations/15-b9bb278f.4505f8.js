
module.exports.id = '15.b9bb278f.4505f8';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow b9bb278f.4505f8 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"b9bb278f.4505f8","type":"flows"}, {
    $set: {"path":"b9bb278f.4505f8","body":[{"id":"a7a34b56.f881f8","type":"http in","z":"b9bb278f.4505f8","name":"tx send","url":"/tx/send","method":"post","upload":false,"swaggerDoc":"","x":270,"y":80,"wires":[["4118058.5e9dafc"]]},{"id":"df5caccd.68271","type":"http response","z":"b9bb278f.4505f8","name":"","statusCode":"","x":673,"y":80,"wires":[]},{"id":"4118058.5e9dafc","type":"async-function","z":"b9bb278f.4505f8","name":"","func":"const nem = global.get('nem.lib');\nconst endpoint = global.get('nem.endpoint');\nconst network = global.get('nem.network');\nconst _ = global.get('_');\n\nlet data = _.get(msg.payload, 'data');\nlet signature = _.get(msg.payload, 'signature');\nif(!data || !signature) {\n    return msg;\n}\nconst sendReply = await nem.com.requests.transaction.announce(endpoint, JSON.stringify({data, signature}));\nconst hash = sendReply.transactionHash.data;\n\n\nconst unconfirmedTxsReply = msg.payload.address ? await nem.com.requests.account.transactions.unconfirmed(endpoint, msg.payload.address) : {};\n\nconst tx = _.chain(unconfirmedTxsReply)\n    .get('data')\n    .find(tx=> _.get(tx, 'transaction.signature') === signature)\n    .defaults({})\n    .value();\n\ntx.meta = {hash: {data: hash}};\n\nif(tx.transaction && tx.transaction.signer){\n  tx.transaction.sender = nem.model.address.toAddress(tx.transaction.signer, network);\n}\n\nmsg.payload = tx;\n\n\nreturn msg;","outputs":1,"noerr":6,"x":470,"y":80,"wires":[["df5caccd.68271"]]},{"id":"238d3630.c4b3ba","type":"catch","z":"b9bb278f.4505f8","name":"","scope":null,"x":260,"y":520,"wires":[["1b3b7f0e.bb0aa1","9186e480.4b3778"]]},{"id":"cbc90a8a.bb3848","type":"http response","z":"b9bb278f.4505f8","name":"","statusCode":"","x":717,"y":521,"wires":[]},{"id":"1b3b7f0e.bb0aa1","type":"function","z":"b9bb278f.4505f8","name":"transform","func":"\nlet factories = global.get(\"factories\"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n   \nreturn msg;","outputs":1,"noerr":0,"x":501,"y":520,"wires":[["cbc90a8a.bb3848"]]},{"id":"9186e480.4b3778","type":"debug","z":"b9bb278f.4505f8","name":"","active":true,"console":"false","complete":"error","x":377.07640075683594,"y":446.347267150879,"wires":[]},{"id":"1130e0ce.31f88f","type":"http in","z":"b9bb278f.4505f8","name":"tx get","url":"/tx/:hash","method":"get","upload":false,"swaggerDoc":"","x":270,"y":180,"wires":[["5e7e73b.9832b8c"]]},{"id":"fce7b30d.f43a5","type":"http response","z":"b9bb278f.4505f8","name":"","statusCode":"","x":814.0000381469727,"y":182.00000381469727,"wires":[]},{"id":"5e7e73b.9832b8c","type":"function","z":"b9bb278f.4505f8","name":"createQuery","func":"const prefix = global.get('settings.mongo.collectionPrefix');\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      hash: msg.req.params.hash\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":421.1909713745117,"y":181.5694808959961,"wires":[["307cc116.65ad3e"]]},{"id":"307cc116.65ad3e","type":"mongo","z":"b9bb278f.4505f8","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":569.1909790039062,"y":183.95488166809082,"wires":[["9424cf26.ce474"]]},{"id":"9424cf26.ce474","type":"function","z":"b9bb278f.4505f8","name":"parse","func":"const _ = global.get('_');\n\n\nmsg.payload = _.get(msg.payload, '0', {});\n\n\nreturn msg;","outputs":1,"noerr":0,"x":691.1805381774902,"y":182.89587020874023,"wires":[["fce7b30d.f43a5"]]},{"id":"7a7c7a26.570344","type":"http in","z":"b9bb278f.4505f8","name":"tx history","url":"/tx/:addr/history","method":"get","upload":false,"swaggerDoc":"","x":223.18751525878906,"y":270.7916946411133,"wires":[["bed9e409.9554e8"]]},{"id":"bed9e409.9554e8","type":"function","z":"b9bb278f.4505f8","name":"create Query","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr.toLowerCase();\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      $or: [\n        {'sender': msg.address},\n        {'recipient': msg.address}\n      ]\n  },\n  options: {\n      sort: {timeStamp: -1},\n      limit: parseInt(msg.req.query.limit) || 100,\n      skip: parseInt(msg.req.query.skip) || 0\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":393.18751525878906,"y":270.68750762939453,"wires":[["3d7e7f0b.feb19"]]},{"id":"3d7e7f0b.feb19","type":"mongo","z":"b9bb278f.4505f8","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":560.0173416137695,"y":271.7881679534912,"wires":[["64c70338.6daf5c"]]},{"id":"64c70338.6daf5c","type":"http response","z":"b9bb278f.4505f8","name":"","statusCode":"","headers":{},"x":757.1805572509766,"y":269.68055725097656,"wires":[]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"b9bb278f.4505f8","type":"flows"}, done);
};
