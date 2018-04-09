module.exports = {
    mongoUrl : 'mongodb://localhost/cdal-services-test',
    servicePort : 4100,
    isMongoDebug : true,

    defaultSettings: {
      minimumConfirmations: 3,
      minimumAddressPoolSize: 10,
      transactionNotificationAPI: 'http://localhost/transactions-notifications',
      currentBlockIndex: 0,
      defaultTransactionsBlockCount: 5000
    },

    daemon: {
      endpoint: 'http://nbrw-dev.kernelits.net:20264/json_rpc'
    },
};
