var util      = require('util');

module.exports = {
    mongoUrl : util.format('mongodb://%s/%s',
                      process.env.DB_SERVER || 'localhost',
                      process.env.DB_NAME   || 'cdal-services'),
    servicePort : process.env.PORT || 4000,
    isMongoDebug : true,
    jwt: {
      secret: 'SECRET_DEV',
      expiresIn: '1h'
    },

    defaultSettings: {
      minimumConfirmations: 3,
      minimumAddressPoolSize: 100,
      transactionNotificationAPI: 'http://localhost/transactions-notifications',
      daemonEndpoint: 'http://bcndaemon:19264/json_rpc',
      currentBlockIndex: 0,
      defaultTransactionsBlockCount: 5000,
      minimumFee: 1000
    }
  };
