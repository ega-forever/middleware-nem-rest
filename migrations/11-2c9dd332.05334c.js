module.exports.id = '11.2c9dd332.05334c';

/**
 * @description flow 2c9dd332.05334c update
 * @param done
 */


module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.update({"path": "2c9dd332.05334c", "type": "flows"}, {
    $set: {
      "path": "2c9dd332.05334c",
      "body": [{
        "id": "5a35929d.0a716c",
        "type": "http in",
        "z": "2c9dd332.05334c",
        "name": "create addr",
        "url": "/addr",
        "method": "post",
        "upload": false,
        "swaggerDoc": "",
        "x": 90,
        "y": 140,
        "wires": [["4ae0a952.a4e188"]]
      }, {
        "id": "e4822e75.693fd",
        "type": "http response",
        "z": "2c9dd332.05334c",
        "name": "",
        "statusCode": "",
        "x": 1250,
        "y": 140,
        "wires": []
      }, {
        "id": "27b27b8e.9827a4",
        "type": "mongo",
        "z": "2c9dd332.05334c",
        "model": "EthAccount",
        "request": "{}",
        "options": "",
        "name": "mongo create addr",
        "mode": "1",
        "requestType": "1",
        "dbAlias": "",
        "x": 828,
        "y": 140,
        "wires": [["8ab75856.970bb8"]]
      }, {
        "id": "8ab75856.970bb8",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform output",
        "func": "\nlet factories = global.get(\"factories\"); \n\nif(msg.payload.error){\n    msg.payload = msg.payload.error.code === 11000 ? \n    factories.messages.address.existAddress :\n    factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1035,
        "y": 140,
        "wires": [["e4822e75.693fd"]]
      }, {
        "id": "65927d71.4e8c44",
        "type": "http in",
        "z": "2c9dd332.05334c",
        "name": "remove addr",
        "url": "/addr",
        "method": "delete",
        "upload": false,
        "swaggerDoc": "",
        "x": 90,
        "y": 540,
        "wires": [["316484c0.63001c"]]
      }, {
        "id": "d0426981.27e8a8",
        "type": "http response",
        "z": "2c9dd332.05334c",
        "name": "",
        "statusCode": "",
        "x": 990,
        "y": 540,
        "wires": []
      }, {
        "id": "7c68e0a0.c140d",
        "type": "mongo",
        "z": "2c9dd332.05334c",
        "model": "EthAccount",
        "request": "{}",
        "options": "",
        "name": "mongo",
        "mode": "1",
        "requestType": "2",
        "dbAlias": "",
        "x": 550,
        "y": 540,
        "wires": [["cdd0bdcd.24b59"]]
      }, {
        "id": "cdd0bdcd.24b59",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform output",
        "func": "\nlet factories = global.get(\"factories\"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 760,
        "y": 540,
        "wires": [["d0426981.27e8a8"]]
      }, {
        "id": "316484c0.63001c",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform params",
        "func": "\nmsg.payload = {\n    model: 'NemAccount', \n    request: [{\n       address: msg.payload.address\n   }, {isActive: false}]\n};\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 290,
        "y": 540,
        "wires": [["7c68e0a0.c140d"]]
      }, {
        "id": "468de3dc.eb162c",
        "type": "http in",
        "z": "2c9dd332.05334c",
        "name": "balance",
        "url": "/addr/:addr/balance",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 90,
        "y": 720,
        "wires": [["6731d0f7.68fb4"]]
      }, {
        "id": "6731d0f7.68fb4",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform params",
        "func": "\nmsg.payload = {\n    model: 'NemAccount', \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 292.500003814698,
        "y": 719.99999809265,
        "wires": [["a66b89d5.08b868"]]
      }, {
        "id": "a66b89d5.08b868",
        "type": "mongo",
        "z": "2c9dd332.05334c",
        "model": "EthAccount",
        "request": "{}",
        "name": "mongo",
        "mode": "1",
        "requestType": "0",
        "x": 482.50000381469795,
        "y": 721.24999904632,
        "wires": [["c0a32965.e18618", "f2ca34c2.42cb08"]]
      }, {
        "id": "6e227f25.b210e",
        "type": "http response",
        "z": "2c9dd332.05334c",
        "name": "",
        "statusCode": "",
        "x": 911.250007629395,
        "y": 719.99999904632,
        "wires": []
      }, {
        "id": "e859d127.685df",
        "type": "catch",
        "z": "2c9dd332.05334c",
        "name": "",
        "scope": ["c0a32965.e18618", "468de3dc.eb162c", "4ae0a952.a4e188", "412afa3f.53ef14", "5a35929d.0a716c", "47425651.340538", "a45e49e.aa809b8", "921b5d7c.258d8", "d9a01fa3.c514d", "681f0fa4.b0249", "396666b3.2232ba", "6e227f25.b210e", "d0426981.27e8a8", "2e2f80ee.29994", "e4822e75.693fd", "a66b89d5.08b868", "7c68e0a0.c140d", "27b27b8e.9827a4", "547d0ad7.ffb894", "f2ca34c2.42cb08", "ad2dddc0.6f6cc", "cea9fdeb.9c011", "65927d71.4e8c44", "f6266e01.f9cca", "3068da30.6185b6", "d47923c.db3aae", "e2235fb1.a525e", "8ab75856.970bb8", "cdd0bdcd.24b59", "316484c0.63001c", "6731d0f7.68fb4"],
        "x": 200,
        "y": 940,
        "wires": [["d47923c.db3aae", "547d0ad7.ffb894"]]
      }, {
        "id": "2e2f80ee.29994",
        "type": "http response",
        "z": "2c9dd332.05334c",
        "name": "",
        "statusCode": "",
        "x": 657,
        "y": 941,
        "wires": []
      }, {
        "id": "d47923c.db3aae",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform",
        "func": "\nlet factories = global.get(\"factories\"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n   \nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 441,
        "y": 940,
        "wires": [["2e2f80ee.29994"]]
      }, {
        "id": "547d0ad7.ffb894",
        "type": "debug",
        "z": "2c9dd332.05334c",
        "name": "",
        "active": true,
        "console": "false",
        "complete": "error",
        "x": 317.076400756836,
        "y": 866.347267150879,
        "wires": []
      }, {
        "id": "4ae0a952.a4e188",
        "type": "async-function",
        "z": "2c9dd332.05334c",
        "name": "calc balance",
        "func": "const nem = global.get('nem.lib'),\n endpoint = global.get('nem.endpoint'),\n websocketEndpoint = global.get('nem.websocketEndpoint'),\n network = global.get('nem.network'),\n _ = global.get('_');\n\nmsg.address = msg.payload.address.replace(/[^\\w\\s]/gi, '');\n\n\nconst connector = nem.com.websockets.connector.create(websocketEndpoint, msg.address);\n\nlet data = await new Promise((res, rej)=>{\n\nconnector.connect().then(function() {\n  nem.com.websockets.subscribe.account.data(connector, res);\n  nem.com.websockets.requests.account.data(connector);\n}, rej);\n});\n\n//let data = await nem.com.requests.account.data(endpoint, msg.payload.address);\n\n\n\nlet balance = _.get(data, 'account.balance', 0);\nlet vestedBalance = _.get(data, 'account.vestedBalance', 0);\n\nlet unconfirmedTxs = await nem.com.requests.account.transactions.unconfirmed(endpoint, msg.address);\n\n\nlet balanceDelta = _.chain(unconfirmedTxs.data)\n        .transform((result, item) => {\n\n          if (item.transaction.recipient === nem.model.address.toAddress(item.transaction.signer, network)) //self transfer\n            return;\n\n          if (msg.address === item.transaction.recipient)\n            result.val += item.transaction.amount;\n\n          if (msg.address === nem.model.address.toAddress(item.transaction.signer, network)) {\n            result.val -= item.transaction.amount;\n          }\n          return result;\n        }, {val: 0})\n        .get('val')\n        .value();\n\n\nlet accMosaics = await nem.com.requests.account.mosaics.owned(endpoint, msg.address);\n\n      const mosaicsConfirmed = _.chain(accMosaics).get('data', []).transform((acc, m) => \n            acc[`${m.mosaicId.namespaceId}:${m.mosaicId.name}`] = m.quantity, \n            {}).value();\n\n\n      let mosaicsUnconfirmed = _.chain(unconfirmedTxs.data)\n        .filter(item=>_.has(item, 'transaction.mosaics'))\n        .transform((result, item) => {\n\n          if (item.transaction.recipient === nem.model.address.toAddress(item.transaction.signer, network)) //self transfer\n            return;\n\n          if (msg.address === item.transaction.recipient) {\n            item.transaction.mosaics.forEach(mosaic => {\n              result[`${mosaic.mosaicId.namespaceId}:${mosaic.mosaicId.name}`] = (result[`${mosaic.mosaicId.namespaceId}:${mosaic.mosaicId.name}`] || 0) + mosaic.quantity\n            });\n\n          }\n\n          if (msg.address === nem.model.address.toAddress(item.transaction.signer, network)) {\n            item.transaction.mosaics.forEach(mosaic => {\n              result[`${mosaic.mosaicId.namespaceId}:${mosaic.mosaicId.name}`] = (result[`${mosaic.mosaicId.namespaceId}:${mosaic.mosaicId.name}`] || 0) - mosaic.quantity\n            });\n          }\n          \n          return result;\n        }, {})\n        .toPairs()\n        .transform((result, pair) => {\n          result[pair[0]] = (mosaicsConfirmed[pair[0]] || 0) + pair[1]\n        }, {})\n        .value();\n\n\nconst mosaics = _.chain(mosaicsConfirmed)\n.toPairs()\n.map(pair=>{\n    const name = pair[0];\n    return [pair[0], {\n        confirmed: pair[1],\n        unconfirmed: mosaicsUnconfirmed[pair[0]] || 0\n    }]\n})\n.fromPairs()\n.value();\n\nmsg.payload = {\n    model: 'NemAccount', \n    request: {\n       address: msg.address,\n       balance: {\n           confirmed: balance,\n           vested: vestedBalance,\n           unconfirmed: balanceDelta ? balance + balanceDelta : 0\n       },\n       mosaics: mosaics\n   }\n};\n\nreturn msg;",
        "outputs": 1,
        "noerr": 8,
        "x": 450,
        "y": 140,
        "wires": [["f6266e01.f9cca"]]
      }, {
        "id": "c0a32965.e18618",
        "type": "async-function",
        "z": "2c9dd332.05334c",
        "name": "",
        "func": "const nem = global.get('nem.lib'),\n endpoint = global.get('nem.endpoint'),\n _ = global.get('_');\n \nlet account = msg.payload[0];\nlet confirmedBalance = _.get(account, 'balance.confirmed', 0);\nlet unconfirmedBalance = _.get(account, 'balance.unconfirmed', 0);\nlet vestedBalance = _.get(account, 'balance.vested', 0);\n\n\n\nlet balance = {\n    confirmed: {\n      value: confirmedBalance,\n      amount: `${(confirmedBalance/1000000).toFixed(6)}`\n    },\n    unconfirmed: {\n      value: unconfirmedBalance,\n      amount: `${(unconfirmedBalance/1000000).toFixed(6)}`\n    },\n    vested: {\n      value: vestedBalance,\n      amount: `${(vestedBalance/1000000).toFixed(6)}`\n    }\n}\n\nlet mosaics = _.chain(account)\n  .get('mosaics')\n  .toPairs()\n  .map(pair=>{\n      let definition = pair[0].split(':');\n      let name = definition[1];\n      let namespaceId = definition[0];\n      return {\n          name: definition[1],\n          namespaceId: definition[0],\n          quantity: pair[1]\n      };\n  })\n  .value();\n\n\n  mosaics = await Promise.map(mosaics, async mosaic=> {\n\n  let definition = await nem.com.requests.namespace.mosaicDefinitions(endpoint, mosaic.namespaceId);\n\n    mosaic.confirmedValue = mosaic.quantity.confirmed / _.chain(definition)\n      .get('data')\n      .find({mosaic: {id: {name: mosaic.name}}})\n      .get('mosaic.properties')\n      .find({name:'divisibility'})\n      .get('value', 1)\n      .thru(val=>Math.pow(10, val))\n      .value();\n      \n      \n    mosaic.unconfirmedValue = mosaic.quantity.unconfirmed / _.chain(definition)\n      .get('data')\n      .find({mosaic: {id: {name: mosaic.name}}})\n      .get('mosaic.properties')\n      .find({name:'divisibility'})\n      .get('value', 1)\n      .thru(val=>Math.pow(10, val))\n      .value();\n\n\nreturn mosaic;      \n      \n  });\n\nmosaics = _.transform(mosaics, (acc, item) => {\n    \n/*    acc[`${item.namespaceId}:${item.name}`] = {\n        amount: item.value,\n        value: item.quantity\n    }*/\n    \n    \n     acc[`${item.namespaceId}:${item.name}`] = {\n        confirmed: {\n          amount: item.confirmedValue,\n          value: item.quantity.confirmed   \n        },\n        unconfirmed: {\n          amount: item.unconfirmedValue,\n          value: item.quantity.unconfirmed \n        },\n    }\n    \n}, {});\n\nmsg.payload = {balance, mosaics};\n\nreturn msg;\n",
        "outputs": 1,
        "noerr": 12,
        "x": 670,
        "y": 720,
        "wires": [["6e227f25.b210e"]]
      }, {
        "id": "f2ca34c2.42cb08",
        "type": "debug",
        "z": "2c9dd332.05334c",
        "name": "",
        "active": true,
        "console": "false",
        "complete": "false",
        "x": 643.0833892822266,
        "y": 647.5625076293945,
        "wires": []
      }, {
        "id": "cea9fdeb.9c011",
        "type": "amqp in",
        "z": "2c9dd332.05334c",
        "name": "post addresses",
        "topic": "${config.rabbit.serviceName}.account.create",
        "iotype": "3",
        "ioname": "events",
        "noack": "1",
        "durablequeue": "1",
        "durableexchange": "0",
        "server": "",
        "servermode": "1",
        "x": 80,
        "y": 200,
        "wires": [["921b5d7c.258d8"]]
      }, {
        "id": "921b5d7c.258d8",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "",
        "func": "\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 270,
        "y": 200,
        "wires": [["4ae0a952.a4e188", "ad2dddc0.6f6cc"]]
      }, {
        "id": "f6266e01.f9cca",
        "type": "switch",
        "z": "2c9dd332.05334c",
        "name": "",
        "property": "amqpMessage",
        "propertyType": "msg",
        "rules": [{"t": "null"}, {"t": "nnull"}],
        "checkall": "true",
        "outputs": 2,
        "x": 630,
        "y": 140,
        "wires": [["27b27b8e.9827a4"], ["681f0fa4.b0249"]]
      }, {
        "id": "681f0fa4.b0249",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "",
        "func": "\nif(msg.amqpMessage)\n    msg.amqpMessage.ack();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 810,
        "y": 240,
        "wires": [["47425651.340538"]]
      }, {
        "id": "47425651.340538",
        "type": "amqp out",
        "z": "2c9dd332.05334c",
        "name": "",
        "topic": "${config.rabbit.serviceName}.account.created",
        "iotype": "3",
        "ioname": "events",
        "server": "",
        "servermode": "1",
        "x": 950,
        "y": 240,
        "wires": []
      }, {
        "id": "412afa3f.53ef14",
        "type": "catch",
        "z": "2c9dd332.05334c",
        "name": "",
        "scope": ["4ae0a952.a4e188"],
        "x": 80,
        "y": 300,
        "wires": [[]]
      }, {
        "id": "a45e49e.aa809b8",
        "type": "amqp out",
        "z": "2c9dd332.05334c",
        "name": "",
        "topic": "${config.rabbit.serviceName}.account.create",
        "iotype": "3",
        "ioname": "events",
        "server": "",
        "servermode": "1",
        "x": 870,
        "y": 360,
        "wires": []
      }, {
        "id": "396666b3.2232ba",
        "type": "http response",
        "z": "2c9dd332.05334c",
        "name": "",
        "statusCode": "",
        "x": 1010,
        "y": 300,
        "wires": []
      }, {
        "id": "e2235fb1.a525e",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "transform output",
        "func": "\nlet factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.success;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 820,
        "y": 300,
        "wires": [["396666b3.2232ba"]]
      }, {
        "id": "ad2dddc0.6f6cc",
        "type": "debug",
        "z": "2c9dd332.05334c",
        "name": "",
        "active": true,
        "console": "true",
        "complete": "payload",
        "x": 460,
        "y": 200,
        "wires": []
      }, {
        "id": "d9a01fa3.c514d",
        "type": "function",
        "z": "2c9dd332.05334c",
        "name": "",
        "func": "msg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 670,
        "y": 360,
        "wires": [["a45e49e.aa809b8"]]
      }, {
        "id": "3068da30.6185b6",
        "type": "switch",
        "z": "2c9dd332.05334c",
        "name": "",
        "property": "amqpMessage",
        "propertyType": "msg",
        "rules": [{"t": "null"}],
        "checkall": "true",
        "outputs": 1,
        "x": 310,
        "y": 300,
        "wires": [["e2235fb1.a525e", "d9a01fa3.c514d"]]
      }]
    }
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({"path": "2c9dd332.05334c", "type": "flows"}, done);
};
