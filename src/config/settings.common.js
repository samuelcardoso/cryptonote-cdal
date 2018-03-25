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
      defaultUnit: 100000000,
      coinSymbol: 'NBR',
      coinName: 'Nióbio Cash',
      currentBlockIndex: 0,
      defaultTransactionsBlockCount: 5000
    },

    daemon: {
      //endpoint: 'http://nbrdaemon:19264/json_rpc'
      endpoint: 'http://bcndaemon:19264/json_rpc'
    },

    transactionNotificationAPI : {
      endpoint: 'http://localhost:3001/v1/transactions/notifications'
    }
  };
