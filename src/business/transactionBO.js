var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var transactionDAO = dependencies.transactionDAO;
  var modelParser = dependencies.modelParser;
  var daemonHelper = dependencies.daemonHelper;
  var addressBO = dependencies.addressBO;
  var addressDAO = addressBO.dependencies.addressDAO;

  return {
    dependencies: dependencies,

    clear: function() {
      return transactionDAO.clear();
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        filter.isEnabled = true;
        logger.info('Listing all transactions by filter ', JSON.stringify(filter));
        transactionDAO.getAll(filter)
          .then(function(r) {
            resolve(r.map(function(item) {
              return modelParser.clear(item);
            }));
          })
          .catch(reject);
      });
    },

    save: function(entity) {
      var chain = Promise.resolve();
      var transaction = null;

      return new Promise(function(resolve, reject) {
        return chain
          .then(function() {
            logger.info('Sending the transaction to the blockchain', JSON.stringify(entity));
            return daemonHelper.sendTransaction(
                entity.anonymity,
                entity.fee,
                0,
                entity.paymentId,
                entity.addresses,
                entity.transfers,
                entity.changeAddress
              );
          })
          .then(function(r) {
            entity.transactionHash = r.result.transactionHash;
            entity.createdAt = new Date();
            entity.isConfirmed = false;
            entity.isNotified = false;
            entity.confirmations = 0;

            logger.info('Getting transaction information by transactionHash', r.result.transactionHash);
            return daemonHelper.getTransaction(entity.transactionHash);
          })
          .then(function(r) {
            entity.blockIndex = r.result.transaction.blockIndex;
            entity.timestamp = r.result.transaction.timestamp;
            entity.amount = r.result.transaction.amount;
            logger.info('Storing the transaction at database', JSON.stringify(entity));

            return transactionDAO.save(entity);
          })
          .then(function(r){
            transaction = modelParser.clear(r);
            var p = [];

            logger.info('Getting the addresses involved on transaction', JSON.stringify(transaction));

            for (var i = 0; i < transaction.addresses.length; i++) {
              logger.info('Getting informations from the address', transaction.addresses[i]);
              p.push(addressDAO.getAll({address: transaction.addresses[i]}));
            }

            return Promise.all(p);
          })
          .then(function(r) {
            var p = [];
            for (var i = 0; i < r.length; i++) {
              if (r[i].length === 0) {
                logger.info('The address ' +
                  transaction.addresses[i] +
                  ' does not exists, it will be stored at database');
                p.push(addressBO.registerAddressFromDaemon(transaction.ownerId, transaction.addresses[i]));
              } else {
                logger.info('The address ' +
                  transaction.addresses[i] +
                  ' was found at database', JSON.stringify(transaction.addresses[i]));
                p.push(Promise.resolve(r[i][0]));
              }
            }

            return Promise.all(p);
          })
          .then(function(r) {
            var p = [];
            logger.info('Updating the addresses balances', JSON.stringify(r));

            for (var i = 0; i < r.length; i++) {
              p.push(addressBO.updateBalance(r[i].address));
            }

            return Promise.all(p);
          })
          .then(function(){
            return modelParser.clear(transaction);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getByTransactionHash: function(ownerId, transactionHash) {
      var self = this;

      return new Promise(function(resolve, reject) {
        var filter = {
          transactionHash: transactionHash,
        };

        if (ownerId) {
          filter.ownerId = ownerId;
        }

        self.getAll(filter)
          .then(function(transactions) {
            if (transactions.length) {
              logger.info('Transactions found by transactionHash', JSON.stringify(transactions[0]));
              return transactions[0];
            } else {
              return null;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    }
  };
};
