var logger              = require('winston');
var model               = require('../models/configuration')();
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
            logger.log('error', 'An error has occurred while deleting all configurations', error);
            reject(err);
          } else {
            logger.log('info', 'The configurations have been deleted succesfully');
            resolve();
          }
        });
      });
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        logger.info('Getting configurations from database', filter);

        model.find(filter, projectionCommonFields)
          .lean()
          .exec()
          .then(function(items) {
            logger.info('%d configurations were returned', items.length);
            resolve(items);
          }).catch(function(erro) {
            logger.log('error', 'An error has ocurred while getting configurations from database', erro);
            reject(erro);
          });
      });
    },

    getById: function(id) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.log('info', 'Getting a configuration by id %s', id);

        self.getAll({_id: id, isEnabled: true})
        .then(function(users) {
          if (users.length === 0) {
            resolve(null);
            logger.log('info', 'Configuration not found');
          } else {
            resolve(users[0]);
            logger.log('info', 'The configuration was found');
          }
        }).catch(function(erro) {
            logger.log('error', 'An error has occurred while getting a configuration by id %s', id, erro);
            reject(erro);
        });
      });
    },

    save: function(entity) {
      var self = this;
      return new Promise(function(resolve, reject) {
        logger.log('info', 'Creating a new configuration', JSON.stringify(entity));
        model.create(entity)
        .then(function(item) {
          logger.log('info', 'The configuration has been created succesfully', JSON.stringify(item));
          return self.getById(item._id);
        })
        .then(resolve)
        .catch(function(error) {
          logger.error('An error has ocurred while saving a new configuration', error);
          reject({
            status: 422,
            message: error.message
          });
        });
      });
    },

    update: function(entity) {
      return new Promise(function(resolve, reject) {
        logger.log('info', 'Update a configuration', JSON.stringify(entity));

        model.findByIdAndUpdate(entity._id, $.flatten(entity), {'new': true, fields: projectionCommonFields})
        .then(function(item) {
          logger.log('info', 'The configuration has been updated succesfully');
          logger.debug(JSON.stringify(item.toObject()));
          resolve(item.toObject());
        }).catch(function(error) {
          logger.error('An error has ocurred while updating a configuration', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    },

    disable: function(id) {
      return new Promise(function(resolve, reject) {
        logger.log('info', 'Disabling a configuration');

        model.findByIdAndUpdate(id, {_id:id, isEnabled: false}, {'new': true, fields: projectionCommonFields})
        .then(function(item) {
          logger.log('info', 'The configuration has been disabled succesfully');
          resolve(item.toObject());
        }).catch(function(error) {
          logger.error('An error has ocurred while disabling a configuration', error);
          reject({
            status: 422,
            message: error
          });
        });
      });
    },
  };
};
