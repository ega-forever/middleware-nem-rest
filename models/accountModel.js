/** 
 * Mongoose model. Accounts
 * @module models/accountModel
 * @returns {Object} Mongoose model
 * @requires factory/addressMessageFactory
 */

const mongoose = require('mongoose');

require('mongoose-long')(mongoose);

const Account = new mongoose.Schema({
  address: {
    type: String,
    unique: true,
    required: true
  },
  balance: {type: mongoose.Schema.Types.Long, default: 0},
  created: {type: Date, required: true, default: Date.now},
  mosaics: {type: mongoose.Schema.Types.Mixed, default: {}}
});

module.exports = mongoose.model('NemAccount', Account);
