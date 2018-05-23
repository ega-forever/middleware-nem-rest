/**
 * Mongoose model. Accounts
 * @module models/accountModel
 * @returns {Object} Mongoose model
 * @requires factory/addressMessageFactory
 * 
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const mongoose = require('mongoose'),
  config = require('../config');


const TX = new mongoose.Schema({
  blockNumber: {type: Number, required: true, index: true, default: -1},
  timeStamp: {type: Number, required: true, index: true, default: Date.now},  
  
  amount: {type: Number, index: true},
  hash: {type: String, index: true, unique: true},

  recipient: {type: String, index: true},
  sender: {type: String, index: true},
  
  nonce: {type: Number},
  input: {type: String},
  
  version: {type: Number},
  signer: {type: String},
  signature: {type: String},
  fee: {type: Number},
  type: {type: String},
  deadline: {type: Number},
  newPart: {type: String},
  rentalFee: {type: String},
  message: {
    payload: {type: String},
    type: {type: Number}
  },
  mosaics: [{
    quantity: {type: Number},
    type: {type: String},      
    supplyType: {type: String},
    delta: {type: String},
    fee: {type: String},
    deadline: {type: String},
    version: {type: Number},
    signature: {type: String},
    timestamp: {type: Number},
    mosaicId: {
      namespaceId: {type: String},
      name: {type: String}
    }
  }]
});


module.exports = mongoose.data.model(`${config.mongo.data.collectionPrefix}TX`, TX);
