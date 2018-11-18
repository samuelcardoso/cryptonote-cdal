var util      = require('util');

module.exports = {
    mongoUrl : util.format('mongodb://%s/%s',
                      process.env.DB_SERVER || 'localhost',
                      process.env.DB_NAME   || 'cdal-services'),
    servicePort : process.env.PORT || 4000,
    isMongoDebug : true,
    jwt: {
      secret: process.env.JWT_SECRET || 'JWT_SECRET',
      expiresIn: '1h'
    },

    defaultSettings: {
      minimumConfirmations: process.env.MIN_CONFIRMATIONS || 3,
      minimumAnonymity: process.env.MIN_ANONYMITY || 1,
      minimumMixin: process.env.MIN_MIXIN || 1,
      minimumAddressPoolSize: process.env.MIN_ADDRESS_POOL_SIZE || 100,
      transactionNotificationAPI: process.env.NOTIFICATION_ADDRESS || 'http://localhost:3000/v1/transactions/notifications',
      daemonEndpoint: util.format('http://%s/json_rpc', process.env.DAEMON_ADDRESS || '18.216.105.158:20264'),
      currentBlockIndex: 0,
      defaultTransactionsBlockCount: 5000
    }
  };
