var logger        = require('../config/logger');
var settings      = require('../config/settings');

module.exports = function(dependencies) {
  var requestHelper = dependencies.requestHelper;

  return {
    daemonEndpoint: settings.daemon.endpoint,

    _main: function(method, params) {
      var body = {
        params: params,
        method: method,
        id: 'ID',
        jsonrpc: '2.0'
      };

      logger.info('[DaemonHelper] Executing the method ' + method + ' at ' + this.daemonEndpoint, JSON.stringify(body));
      return requestHelper.postJSON(this.daemonEndpoint, [], body, []);
    },

    getAddresses: function() {
      return this._main('getAddresses');
    },

    getSpendKeys: function(address) {
      return this._main('getSpendKeys', {address: address});
    },

    getViewKey: function() {
      return this._main('getViewKey');
    },

    createAddress: function() {
      return this._main('createAddress');
    },

    getBalance: function(address) {
      return this._main('getBalance', {address: address});
    },

    getTransactions: function(firstBlockIndex, blockCount, addresses, paymentId) {
      return this._main('getTransactions', {
        firstBlockIndex: firstBlockIndex,
        blockCount: blockCount,
        addresses: addresses,
        paymentId: paymentId
      });
    },

    getTransaction: function(transactionHash) {
      return this._main('getTransaction', {transactionHash: transactionHash});
    },

    getStatus: function() {
      return this._main('getStatus');
    },

    sendTransaction: function(anonymity, fee, unlockTime, paymentId, addresses, transfers, changeAddress) {
      return this._main('sendTransaction', {
        anonymity: anonymity,
        fee: fee,
        unlockTime: unlockTime,
        paymentId: paymentId,
        addresses: addresses,
        transfers: transfers,
        changeAddress: changeAddress
      });
    },

    deleteAddress: function(address) {
      return this._main('deleteAddress', {address: address});
    },
  };
};
