var Promise         = require('promise');
var logger          = require('../config/logger');
var settings          = require('../config/settings');

module.exports = function(dependencies) {
  var configurationDAO = dependencies.configurationDAO;
  var modelParser = dependencies.modelParser;
  var dateHelper = dependencies.dateHelper;

  return {
    dependencies: dependencies,

    clear: function() {
      return configurationDAO.clear();
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        if (!filter) {
          filter = {};
        }

        filter.isEnabled = true;

        logger.info('[ConfigurationBO] Listing all configurations by filter ', filter);
        configurationDAO.getAll(filter)
          .then(function(r) {
            logger.info('[ConfigurationBO] Total of configurations', r.length);
            return r.map(function(item) {
              return modelParser.clear(item);
            });
          })
          .then(resolve)
          .catch(reject);
      });
    },

    save: function(entity) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(entity.key)
          .then(function(configuration) {
            if (!configuration.id) {
              logger.debug('[ConfigurationBO] Saving the configuration. Entity: ', JSON.stringify(entity));
              var o = modelParser.prepare(entity, true);
              o.createdAt = dateHelper.getNow();
              logger.debug('[ConfigurationBO] Entity  after prepare: ', JSON.stringify(o));
              return configurationDAO.save(o);
            } else {
              throw {
                status: 409,
                message: 'The key ' + entity.key + ' is already in use by other configuration'
              };
            }
          })
          .then(function(r) {
            logger.info('ConfigurationBO] Configuration saved successfully', JSON.stringify(r));
            return modelParser.clear(r);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    initialize: function(entity) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByKey(entity.key)
          .then(function(configuration) {
            if (!configuration.id) {
              return self.save(entity);
            } else {
              return configuration;
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
            if (configuration && configuration.id) {
              configuration = modelParser.prepare(configuration);
              configuration.updatedAt = dateHelper.getNow();
              configuration.value = entity.value;
              logger.info('[ConfigurationBO] Updating configuration', JSON.stringify(configuration));
              return configurationDAO.update(configuration);
            } else {
              logger.info('[ConfigurationBO] An error will be thrown because there is no configuration to key',
                entity.key,
                JSON.stringify(configuration));

              throw {
                status: 404,
                message: 'The configuration ' + entity.key + ' was not found'
              };
            }
          })
          .then(function(r) {
            logger.info('[ConfigurationBO] Configuration was updated successfully',
              JSON.stringify(r));
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

        logger.info('[ConfigurationBO] Getting a configuration by key', key);

        self.getAll(filter)
          .then(function(configurations) {
            if (configurations.length) {
              logger.info('[ConfigurationBO] Configuration found by key', JSON.stringify(configurations[0]));
              return configurations[0];
            } else {
              logger.warn('[ConfigurationBO] There is no configuration to provided key', key);
              var r = {
                key: key,
                value: settings.defaultSettings[key]
              };
              logger.debug('[ConfigurationBO] Returning default settings from configuration file', JSON.stringify(r));
              return r;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    delete: function(key) {
      var self = this;

      return new Promise(function(resolve, reject) {
        logger.info('[ConfigurationBO] Disabling a configuration', key);

        self.getByKey(key)
          .then(function(configuration) {
            if (!configuration.id) {
              logger.warn('[ConfigurationBO] A error will be thrown. There is no configuration to the provided key',
                key);
              throw {
                status: 404,
                message: 'The configuration ' + key + ' was not found'
              };
            } else {
              return configurationDAO.disable(configuration.id);
            }
          })
          .then(function() {
            logger.warn('[ConfigurationBO] Configuration disabled successfully', key);
            return;
          })
          .then(resolve)
          .catch(reject);
      });
    }
  };
};
