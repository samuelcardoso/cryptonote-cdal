var logger              = require('winston');
var model               = require('../models/transaction')();
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
            logger.log('error', '[TransactionDAO] An error has occurred while deleting all transactions', error);
            reject(err);
          } else {
            logger.log('info', '[TransactionDAO] The transactions have been deleted succesfully');
            resolve();
          }
        });
      });
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        logger.info('[TransactionDAO] Getting transactions from database', filter);

        model.find(filter, projectionCommonFields)
          .lean()
          .exec()
          .then(function(items) {
            logger.info('[TransactionDAO] %d transactions were returned', items.length);
            resolve(items);
          }).catch(function(erro) {
            logger.log('error', '[TransactionDAO] An error has ocurred while getting transactions from database', erro);
            reject(erro);
          });
      });
    },

    getById: function(id) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.log('info', '[TransactionDAO] Getting a transaction by id %s', id);

        self.getAll({_id: id})
        .then(function(users) {
          if (users.length === 0) {
            resolve(null);
            logger.log('info', '[TransactionDAO] The transaction not found');
          } else {
            resolve(users[0]);
            logger.log('info', '[TransactionDAO] The transaction was found');
          }
        }).catch(function(erro) {
            logger.log('error', '[TransactionDAO] An error has occurred while getting a transaction by id %s', id, erro);
            reject(erro);
        });
      });
    },

    save: function(entity) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.log('info', '[TransactionDAO] Creating a new transaction', JSON.stringify(entity));
        model.create(entity)
        .then(function(item) {
          logger.log('info', '[TransactionDAO] The transaction has been created succesfully', JSON.stringify(item));
          return self.getById(item._id);
        })
        .then(resolve)
        .catch(function(error) {
          logger.error('[TransactionDAO] An error has ocurred while saving a new transaction', error);
          reject({
            status: 422,
            message: error.message
          });
        });
      });
    },

    update: function(entity) {
      return new Promise(function(resolve, reject) {
        logger.log('info', '[TransactionDAO] Update a transaction', JSON.stringify(entity));

        model.findByIdAndUpdate(entity._id, $.flatten(entity), {'new': true, fields: projectionCommonFields})
        .then(function(item) {
          logger.log('info', '[TransactionDAO] The transaction has been updated succesfully');
          logger.debug(JSON.stringify(item.toObject()));
          resolve(item.toObject());
        }).catch(function(error) {
          logger.error('[TransactionDAO] An error has ocurred while updating a transaction', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    },

    updateIsConfirmedFlag: function(transactionHash) {
      return new Promise(function(resolve, reject) {
        logger.log('info', '[TransactionDAO] Updating isConfirmedFlag from transactions ', confirmedBlockIndex);

        model.updateMany({transactionHash: transactionHash}, $.flatten({isConfirmed: true}, {multi: true}))
        .then(function() {
          logger.log('info', '[TransactionDAO] The transactions has been updated succesfully');
          resolve();
        }).catch(function(error) {
          logger.error('[TransactionDAO] An error has ocurred while updating isConfirmedFlag', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    }
  };
};
