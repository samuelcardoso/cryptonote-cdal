var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var transactionDAO = dependencies.transactionDAO;
  var modelParser = dependencies.modelParser;
  var daemonHelper = dependencies.daemonHelper;
  var addressBO = dependencies.addressBO;
  var addressDAO = dependencies.addressDAO;
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

        filter.isEnabled = true;

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

    save: function(entity) {
      var chain = Promise.resolve();
      var transaction = null;

      return new Promise(function(resolve, reject) {
        return chain
          .then(function() {
            logger.info('[TransactionBO] Sending the transaction to the blockchain', JSON.stringify(entity));
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
            entity.createdAt = dateHelper.getNow();
            entity.isConfirmed = false;
            entity.isNotified = false;

            logger.info('[TransactionBO] Getting transaction information by transactionHash', r.result.transactionHash);
            return daemonHelper.getTransaction(entity.transactionHash);
          })
          .then(function(r) {
            entity.blockIndex = r.result.transaction.blockIndex;
            entity.timestamp = r.result.transaction.timestamp;
            entity.amount = r.result.transaction.amount;
            logger.info('[TransactionBO] Storing the transaction at database', JSON.stringify(entity));

            return transactionDAO.save(entity);
          })
          .then(function(r){
            transaction = modelParser.clear(r);
            var p = [];

            logger.info('[TransactionBO] Getting the addresses involved on transaction', JSON.stringify(transaction));

            for (var i = 0; i < transaction.addresses.length; i++) {
              logger.info('[TransactionBO] Getting informations from the address', transaction.addresses[i]);
              p.push(addressDAO.getAll({address: transaction.addresses[i], isEnabled: true}));
            }

            return Promise.all(p);
          })
          .then(function(r) {
            var p = [];
            logger.info('[TransactionBO] Getting the returning from database', JSON.stringify(r));

            for (var i = 0; i < r.length; i++) {
              if (r[i].length === 0) {
                logger.info('[TransactionBO] The address ' +
                  transaction.addresses[i] +
                  ' does not exist, it will be stored at database');
                p.push(addressBO.registerAddressFromDaemon(transaction.ownerId, transaction.addresses[i]));
              } else {
                logger.info('[TransactionBO] The address ' +
                  transaction.addresses[i] +
                  ' was found at database', JSON.stringify(transaction.addresses[i]));
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
    },

    updateTransactionFromBlockChain: function(transaction, blockchainTransaction) {
      return new Promise(function(resolve, reject) {
        console.log(123123);
        transaction.blockIndex = blockchainTransaction.blockIndex;
        transaction.timestamp = blockchainTransaction.timestamp;

        var o = modelParser.prepare(transaction);

        console.log(o);

        transactionDAO.update(o)
          .then(resolve)
          .catch(reject);
      });
    },

    createTransactionFromBlockChain: function(blockchainTransaction) {
      return new Promise(function(resolve, reject) {
        var t = {
          anonymity: 0,
          amount: blockchainTransaction.amount,
          blockIndex: blockchainTransaction.blockIndex,
          fee: blockchainTransaction.fee,
          paymentId: blockchainTransaction.paymentId,
          timestamp: blockchainTransaction.timestamp,
          timestamp: blockchainTransaction.timestamp,
          transactionHash: blockchainTransaction.transactionHash,
          extra: blockchainTransaction.extra,
          createdAt: new Date(),
          isConfirmed: false,
          isNotified: false,
          confirmations: 0,
          createdByBOS: true
        };

        if (blockchainTransaction.transfers.length > 0) {
          logger.info('Updating informations about transfers.');
          logger.info('First will be used as address and others put in transfers array');
          t.addresses = [blockchainTransaction.transfers[0].address];
          t.transfers = [];

          logger.info('Putting the other transfers to transfers array');
          for (var i = 1; i < blockchainTransaction.transfers.length; i++) {
            t.transfers.push(blockchainTransaction.transfers[i]);
          }
        }
        console.log(t);
        transactionDAO.save(t)
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
            logger.info('Trying to get the transaction from database ', transaction.transactionHash);
            return self.getByTransactionHash(null, transaction.transactionHash);
          })
          .then(function(r) {
            if (r) {
              logger.info('The transaction was found at database. Blockindex and timestamp will be updated',
                transaction.transactionHash,
                transaction.blockIndex,
                transaction.blockIndex);

              return self.updateTransactionFromBlockChain(r, transaction);
            } else {
              logger.info('The transaction was not found at database',
                transaction.transactionHash,
                transaction.blockIndex,
                transaction.blockIndex);

              return self.createTransactionFromBlockChain(transaction);
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
