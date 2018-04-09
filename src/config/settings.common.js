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
      currentBlockIndex: 0,
      defaultTransactionsBlockCount: 5000,
      minimumFee: 1000
    },

    daemon: {
      //endpoint: 'http://nbrdaemon:19264/json_rpc'
      endpoint: 'http://bcndaemon:19264/json_rpc'
    },

    transactionNotificationAPI : {
      endpoint: 'http://localhost:3001/v1/transactions/notifications'
    }
  };
