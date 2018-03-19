var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var configurationBO = dependencies.configurationBO;
  var addressBO = dependencies.addressBO;

  return {
    dependencies: dependencies,

    run: function() {
      return this.maintainPool();
    },

    maintainPool: function() {
      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();
        var minimumAddressPoolSize = 0;

        chain
          .then(function() {
            return configurationBO.getByKey('minimumAddressPoolSize');
          })
          .then(function(r) {
            logger.info('The minimum size for the pool is ', minimumAddressPoolSize);
            minimumAddressPoolSize = r.value;
          })
          .then(function() {
            logger.info('Listing free addresses from database');
            return addressBO.getFreeAddresses();
          })
          .then(function(r) {
            var diff = minimumAddressPoolSize - r.length;
            var p = [];

            if (diff > 0) {
              logger.info('Total of addresses to create to keep the pool consistent', diff);
              for (var i = 0; i < diff; i++) {
                p.push(addressBO.createAddressFromDaemon());
              }
            } else {
              logger.info('The pool is ok no address is needed to be created');
            }

            return Promise.all(p);
          })
          .then(resolve)
          .catch(reject);
      });
    }
  };
};
