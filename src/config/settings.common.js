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
      transactionNotificationAPI: 'http://localhost/transactions-notifications',
      defaultUnit: 100000000,
      coinSymbol: 'BCN',
      coinName: 'ByteCoin'
    },

    daemon: {
      endpoint: 'http://ec2-18-220-131-221.us-east-2.compute.amazonaws.com:8070/json_rpc'
    }
  };
