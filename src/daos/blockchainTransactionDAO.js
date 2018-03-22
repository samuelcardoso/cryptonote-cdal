var logger              = require('winston');
var model               = require('../models/blockchainTransaction')();
var Promise             = require('promise');
var $                   = require('mongo-dot-notation');

module.exports = function() {
  var projectionCommonFields = {
    __v: false
  };

  return {
    clear: function() {
      return new Promise(function(resolve, reject) {
        model.remove({}, function(err) {
          if (err) {
            logger.error('[BlockchainTransactionDAO] An error has occurred while deleting all blockchain transactions', error);
            reject(err);
          } else {
            logger.info('[BlockchainTransactionDAO] The blockchain transactions have been deleted succesfully');
            resolve();
          }
        });
      });
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        logger.info('[BlockchainTransactionDAO] Getting blockchain transactions from database', filter);

        model.find(filter, projectionCommonFields)
          .lean()
          .exec()
          .then(function(items) {
            logger.info('[BlockchainTransactionDAO] %d blockchain transactions were returned', items.length);
            resolve(items);
          }).catch(function(erro) {
            logger.error('[BlockchainTransactionDAO] An error has ocurred while getting blockchain transactions from database', erro);
            reject(erro);
          });
      });
    },

    getById: function(id) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.info('[BlockchainTransactionDAO] Getting a blockchain transaction by id %s', id);

        self.getAll({_id: id})
        .then(function(items) {
          if (items.length === 0) {
            resolve(null);
            logger.info('[BlockchainTransactionDAO] The blockchain transaction not found');
          } else {
            resolve(items[0]);
            logger.info('[BlockchainTransactionDAO] The blockchain transaction was found');
          }
        }).catch(function(erro) {
            logger.error('[BlockchainTransactionDAO] An error has occurred while getting a blockchain transaction by id %s', id, erro);
            reject(erro);
        });
      });
    },

    save: function(entity) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.info('[BlockchainTransactionDAO] Creating a new blockchain transaction', JSON.stringify(entity));
        model.create(entity)
        .then(function(item) {
          logger.info('[BlockchainTransactionDAO] The blockchain transaction has been created succesfully', JSON.stringify(item));
          return self.getById(item._id);
        })
        .then(resolve)
        .catch(function(error) {
          logger.error('[BlockchainTransactionDAO] An error has ocurred while saving a new blockchain transaction', error);
          reject({
            status: 422,
            message: error.message
          });
        });
      });
    },

    update: function(entity) {
      return new Promise(function(resolve, reject) {
        logger.info('[BlockchainTransactionDAO] Update a blockchain transaction', JSON.stringify(entity));

        model.findByIdAndUpdate(entity._id, $.flatten(entity), {'new': true, fields: projectionCommonFields})
        .then(function(item) {
          logger.info('[BlockchainTransactionDAO] The blockchain transaction has been updated succesfully');
          logger.debug(JSON.stringify(item.toObject()));
          resolve(item.toObject());
        }).catch(function(error) {
          logger.error('[BlockchainTransactionDAO] An error has ocurred while updating a blockchain transaction', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    },

    updateIsConfirmedFlag: function(confirmedBlockIndex) {
      return new Promise(function(resolve, reject) {
        logger.log('info', '[BlockchainTransactionDAO] Updating isConfirmedFlag from blockchain transactions ', confirmedBlockIndex);

        model.updateMany({blockIndex: {$lte: confirmedBlockIndex}}, $.flatten({isConfirmed: true}, {multi: true}))
        .then(function() {
          logger.log('info', '[BlockchainTransactionDAO] The blockchain transactions has been updated succesfully');
          resolve();
        }).catch(function(error) {
          logger.error('[BlockchainTransactionDAO] An error has ocurred while updating isConfirmedFlag', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    }
  };
};
