/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
require('dotenv').config();
const config = require('../../config');

config['dev'] = {
  accounts: [process.env.ADDRESS_ONE ,process.env.ADDRESS_TWO],
  proxyPort: 3001,
  signature: 'token123',
  ['ethereum-public-key']: 'dsfdsfsfsdfsdfsdfsdf',
  ['nem-addresss']: '3JfE6tjeT7PnpuDQKxiVNLn4TJUFhuMaaT5'
};

module.exports =  config;
