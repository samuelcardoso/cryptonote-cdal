var settings            = require('./config/settings');
var ConfigurationBO     = require('./business/configurationBO');
var DAOFactory          = require('./daos/daoFactory');
var ModelParser         = require('./models/modelParser');
var logger              = require('./config/logger');
var BOSWorker           = require('./workers/bosWorker');
var AAPMSWorker         = require('./workers/aapmsWorker');
var TransactionBO       = require('./business/transactionBO');
var AddressBO           = require('./business/addressBO');
var ConfigurationBO     = require('./business/configurationBO');
var DAOFactory          = require('./daos/daoFactory');
var ModelParser         = require('./models/modelParser');
var DaemonHelper        = require('./helpers/daemonHelper');
var RequestHelper       = require('./helpers/requestHelper');

module.exports = function() {
  return {
    runWorkers: function() {
      var addressBO = new AddressBO({
        addressDAO: DAOFactory.getDAO('address'),
        modelParser: new ModelParser(),
        daemonHelper: new DaemonHelper({
          requestHelper: new RequestHelper({
            request: require('request')
          })
        })
      });

      var configurationBO = new ConfigurationBO({
        configurationDAO: DAOFactory.getDAO('configuration'),
        modelParser: new ModelParser()
      });

      var transactionBO = new TransactionBO({
        addressBO: addressBO,
        transactionDAO: DAOFactory.getDAO('transaction'),
        modelParser: new ModelParser(),
        daemonHelper: new DaemonHelper({
          requestHelper: new RequestHelper({
            request: require('request')
          })
        })
      });

      var bosWorker = new BOSWorker({
        addressBO: addressBO,
        transactionBO: transactionBO,
        configurationBO: configurationBO,
        daemonHelper: new DaemonHelper({
          requestHelper: new RequestHelper({
            request: require('request')
          })
        })
      }, true);

      var aapmsWorker = new AAPMSWorker({
        addressBO: addressBO,
        configurationBO: configurationBO
      });

      bosWorker.run();
      aapmsWorker.run();
    },

    configureDefaultSettings: function() {
      logger.info('Creating default configurations to the system...');

      var configurationBO = new ConfigurationBO({
        configurationDAO: DAOFactory.getDAO('configuration'),
        modelParser: new ModelParser()
      });

      var p = [];

      for (var property in settings.defaultSettings) {
        logger.info('Setting up the configuration ' + property + ' to ' + settings.defaultSettings[property]);
         p.push(configurationBO.initialize({
           key: property,
           value: settings.defaultSettings[property]
         }));
      }

      logger.info('All promises has been created');
      return Promise.all(p);
    },

    configureApplication: function() {
      var self = this;
      this.configureDefaultSettings()
        .then(function() {
          self.runWorkers();
        });
    }
  };
};
