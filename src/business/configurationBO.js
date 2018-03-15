var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var configurationDAO = dependencies.configurationDAO;
  var modelParser = dependencies.modelParser;

  return {
    dependencies: dependencies,

    clear: function() {
      return configurationDAO.clear();
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        filter.isEnabled = true;
        logger.info('Listing all configurations by filter ', filter);
        configurationDAO.getAll(filter)
          .then(function(r) {
            resolve(r.map(function(item) {
              return modelParser.clear(item);
            }));
          })
          .catch(reject);
      });
    },

    save: function(entity) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(entity.key)
          .then(function(configuration) {
            if (!configuration) {
              logger.debug('Saving the configuration. Entity: ', JSON.stringify(entity));
              var o = modelParser.prepare(entity, true);
              o.createdAt = new Date();
              logger.debug('Entity  after prepare: ', JSON.stringify(o));
              return configurationDAO.save(o);
            } else {
              throw {
                status: 409,
                message: 'The key ' + entity.key + ' is already in use by other configuration'
              };
            }
          })
          .then(function(r) {
            resolve(modelParser.clear(r));
          })
          .catch(reject);
      });
    },

    saveOrUpdate: function(entity) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(entity.key)
          .then(function(configuration) {
            if (!configuration) {
              return self.save(entity);
            } else {
              configuration.value = entity.value;
              return self.update(configuration);
            }
          })
          .then(function(r) {
            return modelParser.clear(r);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    update: function(entity) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(entity.key)
          .then(function(configuration) {
            if (configuration) {
              configuration = modelParser.prepare(configuration);
              configuration.updatedAt = new Date();
              configuration.value = entity.value;
              return configurationDAO.update(configuration);
            } else {
              throw {
                status: 404,
                message: 'The configuration ' + entity.key + ' was not found'
              };
            }
          })
          .then(function(r) {
            return modelParser.clear(r);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getByKey: function(key) {
      var self = this;

      return new Promise(function(resolve, reject) {
        var filter = {
          key: key
        };

        self.getAll(filter)
          .then(function(configurations) {
            if (configurations.length) {
              logger.info('Configuration found by key', JSON.stringify(configurations[0]));
              return configurations[0];
            } else {
              return null;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    delete: function(key) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(key)
          .then(function(configuration) {
            if (!configuration) {
              throw {
                status: 404,
                message: 'Configuration not found'
              };
            } else {
              return configurationDAO.disable(configuration.id);
            }
          })
          .then(resolve)
          .catch(reject);
      });
    }
  };
};
