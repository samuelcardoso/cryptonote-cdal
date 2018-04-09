var logger        = require('../config/logger');
var settings      = require('../config/settings');

module.exports = function(dependencies) {
  var requestHelper = dependencies.requestHelper;

  return {
    daemonEndpoint: settings.daemon.endpoint,

    _main: function(method, params) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        var body = {
          params: params,
          method: method,
          id: 'ID',
          jsonrpc: '2.0'
        };

        chain
          .then(function() {
            logger.info('[DaemonHelper] Executing the method ' + method + ' at ' + self.daemonEndpoint, JSON.stringify(body));
            return requestHelper.postJSON(self.daemonEndpoint, [], body, []);
          })
          .then(function(r) {
            logger.info('[DaemonHelper] Parsing the daemon return', JSON.stringify(r));

            if (!r.error) {
              return r;
            } else {
              self._throwDaemonError(r);
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getAddresses: function() {
      return this._main('getAddresses');
    },

    getUnconfirmedTransactionHashes: function(addresses) {
      return this._main('getUnconfirmedTransactionHashes', {addresses: addresses || []});
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

    _throwDaemonError: function(r) {
      switch (r.error.code) {
        case -32601:
          throw {
            status: 500,
            message: r.error.message,
            details: r
          };
        case -32600:
          throw {
            status: 409,
            code: 'INVALID_REQUEST',
            message: r.error.message,
            details: r
          };
        case -32000:
          switch (r.error.data.application_code) {
            case 4:
              throw {
                status: 404,
                message: 'Requested object not found',
                error: 'OBJECT_NOT_FOUND',
                details: r
              };
            case 7:
              throw {
                status: 409,
                message: 'Bad address',
                error: 'ERROR_TRANSACTION_BAD_ADDRESS',
                details: r
              };
            case 9:
              throw {
                status: 409,
                message: 'Wrong amount',
                error: 'ERROR_TRANSACTION_WRONG_AMOUNT',
                details: r
              };
            case 17:
              throw {
                status: 409,
                message: 'Transaction fee is too small',
                error: 'ERROR_TRANSACTION_SMALL_FEE',
                details: r
              };
            default:
              throw {
                status: 409,
                message: 'An error has occurred while processing this transaction. ' + r.error.message,
                details: r
              };
          }
        default:
          throw {
            status: 500,
            message: 'An expected error has occurred while processing',
            details: r
          };
      }
    }
  };
};
