var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var transactionDAO = dependencies.transactionDAO;
  var transactionRequestDAO = dependencies.transactionRequestDAO;
  var blockchainTransactionDAO = dependencies.blockchainTransactionDAO;
  var modelParser = dependencies.modelParser;
  var daemonHelper = dependencies.daemonHelper;
  var addressBO = dependencies.addressBO;
  var dateHelper = dependencies.dateHelper;

  return {
    dependencies: dependencies,

    clear: function() {
      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        chain
          .then(function() {
            logger.info('[TransactionBO] Clearing the database');
            return transactionDAO.clear();
          })
          .then(function() {
            logger.info('[TransactionBO] The database has been cleared');
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        if (!filter) {
          filter = {};
        }

        logger.info('[TransactionBO] Listing all transactions by filter ', JSON.stringify(filter));
        transactionDAO.getAll(filter)
          .then(function(r) {
            logger.info('[TransactionBO] Total of transactions', r.length);
            return r.map(function(item) {
              return modelParser.clear(item);
            });
          })
          .then(resolve)
          .catch(reject);
      });
    },

    updateTransactionRequestAddressesBalances: function(transactionRequest) {
      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        chain
          .then(function(){
            var p = [];

            logger.info('[TransactionBO] Getting the addresses involved on transaction request', JSON.stringify(transactionRequest));

            for (var i = 0; i < transactionRequest.addresses.length; i++) {
              logger.info('[TransactionBO] Getting informations from the address', transactionRequest.addresses[i]);
              p.push(addressBO.getAll({address: transactionRequest.addresses[i]}));
            }

            return Promise.all(p);
          })
          .then(function(r) {
            var p = [];
            logger.info('[TransactionBO] Getting the returning from database', JSON.stringify(r));

            for (var i = 0; i < r.length; i++) {
              if (r[i].length === 0) {
                logger.info('[TransactionBO] The address ' +
                  transactionRequest.addresses[i] +
                  ' does not exist, it will be stored at database');
                p.push(addressBO.registerAddressFromDaemon(transactionRequest.ownerId, transactionRequest.addresses[i]));
              } else {
                logger.info('[TransactionBO] The address ' +
                  transactionRequest.addresses[i] +
                  ' was found at database', JSON.stringify(transactionRequest.addresses[i]));
                p.push(Promise.resolve(r[i][0]));
              }
            }

            return Promise.all(p);
          })
          .then(function(r) {
            var p = [];
            logger.info('[TransactionBO] Updating the addresses balances', JSON.stringify(r));

            for (var i = 0; i < r.length; i++) {
              logger.info('[TransactionBO] Updating the address balance ', JSON.stringify(r[i]));
              p.push(addressBO.updateBalance(r[i].address));
            }

            logger.debug('[TransactionBO] Returning promises', p.length);
            return Promise.all(p);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    save: function(entity) {
      var self = this;
      var chain = Promise.resolve();
      var transactionRequest = entity;

      return new Promise(function(resolve, reject) {
        return chain
          .then(function() {
            transactionRequest.status = 0;
            transactionRequest.createdAt = dateHelper.getNow();

            logger.info('[TransactionBO] Saving the transaction request', JSON.stringify(transactionRequest));
            return transactionRequestDAO.save(transactionRequest);
          })
          .then(function(r) {
            transactionRequest._id = r._id;
            logger.info('[TransactionBO] Sending the transaction to the blockchain', JSON.stringify(transactionRequest));
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
            logger.debug('[TransactionBO] Return of blockchain', JSON.stringify(r));

            transactionRequest.status = 1;
            transactionRequest.transactionHash = r.result.transactionHash;
            transactionRequest.updatedAt = dateHelper.getNow();

            logger.info('[TransactionBO] Updating the transaction request ', JSON.stringify(transactionRequest));

            return transactionRequestDAO.update(transactionRequest);
          })
          .then(function(){
            logger.info('[TransactionBO] Getting transaction information by transactionHash', transactionRequest.transactionHash);
            return daemonHelper.getTransaction(transactionRequest.transactionHash);
          })
          .then(function(r) {
            logger.info('[TransactionBO] Storing the transaction at database', JSON.stringify(r.result.transaction));
            return blockchainTransactionDAO.save(r.result.transaction);
          })
          .then(function() {
            logger.info('[TransactionBO] Updating the addresses balances involved at this transaction', JSON.stringify(transactionRequest.addresses));
            return self.updateTransactionRequestAddressesBalances(transactionRequest);
          })
          .then(function(){
            return modelParser.clear(transactionRequest);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getBlockchainTransactionByTransactionHash: function(transactionHash) {
      return new Promise(function(resolve, reject) {
        var filter = {
          transactionHash: transactionHash,
        };

        blockchainTransactionDAO.getAll(filter)
          .then(function(transactions) {
            if (transactions.length) {
              logger.info('[TransactionBO] Blockchain transaction found by transactionHash', JSON.stringify(transactions[0]));
              return transactions[0];
            } else {
              logger.info('[TransactionBO] Blockchain transaction not found by transactionHash', transactionHash);
              return null;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    updateBlockchainTransaction: function(transaction, blockchainTransaction) {
      return new Promise(function(resolve, reject) {
        var o = modelParser.prepare(transaction);
        o.blockIndex = blockchainTransaction.blockIndex;
        o.timestamp = blockchainTransaction.timestamp;
        o.updatedAt = dateHelper.getNow();

        blockchainTransactionDAO.update(o)
          .then(resolve)
          .catch(reject);
      });
    },

    createBlockchainTransaction: function(blockchainTransaction) {
      return new Promise(function(resolve, reject) {
        var o = modelParser.prepare(blockchainTransaction, true);
        o.createdAt = dateHelper.getNow();
        blockchainTransactionDAO.save(o)
          .then(resolve)
          .catch(reject);
      });
    },

    parseTransaction: function(transaction) {
      var self = this;

      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        chain
          .then(function() {
            logger.info('[TransactionBO] Trying to get the blockchain transaction from database ', transaction.transactionHash);
            return self.getBlockchainTransactionByTransactionHash(transaction.transactionHash);
          })
          .then(function(r) {
            if (r) {
              logger.info('[TransactionBO] The transaction was found. Blockindex and timestamp will be updated',
                transaction.transactionHash,
                transaction.blockIndex,
                transaction.timestamp);

              return self.updateBlockchainTransaction(r, transaction);
            } else {
              logger.info('[TransactionBO] The transaction was not found at database',
                transaction.transactionHash,
                transaction.blockIndex,
                transaction.timestamp);

              return self.createBlockchainTransaction(transaction);
            }
          })
          .then(function(r){
            return modelParser.clear(r);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    updateIsConfirmedFlag: function(confirmedBlockIndex) {
      return transactionDAO.updateIsConfirmedFlag(confirmedBlockIndex);
    }
  };
};
