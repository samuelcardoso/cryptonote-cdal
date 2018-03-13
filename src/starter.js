var settings            = require('./config/settings');
var ConfigurationBO     = require('./business/configurationBO');
var DAOFactory          = require('./daos/daoFactory');
var ModelParser         = require('./models/modelParser');
var logger              = require('./config/logger');

module.exports = function() {
  return {
    configureDefaultSettings: function() {
      logger.info('Creating default configurations to the system...');

      var configurationBO = new ConfigurationBO({
        configurationDAO: DAOFactory.getDAO('configuration'),
        modelParser: new ModelParser()
      });

      var p = [];

      for (var property in settings.defaultSettings) {
        logger.info('Setting up the configuration ' + property + ' to ' + settings.defaultSettings[property]);
         p.push(configurationBO.saveOrUpdate({
           key: property,
           value: settings.defaultSettings[property]
         }));
      }

      logger.info('All promises has been created');
      return Promise.all(p);
    },

    configureApplication: function() {
      var self = this;
      var chain = Promise.resolve();

      if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
        chain;
      } else {
        return chain
          .then(function() {
            return self.configureDefaultSettings();
          });
      }
    }
  };
};
