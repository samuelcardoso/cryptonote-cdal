var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var addressDAO = dependencies.addressDAO;
  var modelParser = dependencies.modelParser;
  var daemonHelper = dependencies.daemonHelper;

  return {
    dependencies: dependencies,

    clear: function() {
      return addressDAO.clear();
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        filter.isEnabled = true;
        logger.info('Listing all addresses by filter ', JSON.stringify(filter));
        addressDAO.getAll(filter)
          .then(function(r) {
            resolve(r.map(function(item) {
              return modelParser.clear(item);
            }));
          })
          .catch(reject);
      });
    },

    createAddressFromDaemon: function() {
      var chain = Promise.resolve();
      var address = null;

      return new Promise(function(resolve, reject) {
        chain
          .then(function() {
            logger.info('Requesting to the daemon a new address');
            return daemonHelper.createAddress();
          })
          .then(function(r) {
            address = {
              address: r.result.address
            };
            return daemonHelper.getSpendKeys(address.address);
          })
          .then(function(r) {
            address.keys = {
              spendPublicKey: r.result.spendPublicKey,
              spendSecretKey: r.result.spendSecretKey
            };

            address.createdAt = new Date();
            address.isEnabled = true;
            address.balance = {
              availabe: 0,
              locked: 0
            };

            return addressDAO.save(address);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    createAddress: function(ownerId) {
      var self = this;
      var chain = Promise.resolve();
      var freeAddress = null;

      return new Promise(function(resolve, reject) {
        return chain
          .then(function() {
            logger.info('Trying to get a free address from database');
            return addressDAO.getFreeAddress();
          })
          .then(function(r) {
            if (!r) {
              logger.info('There is no free address at database a brande new address will be request to the daemon');
              return self.createAddressFromDaemon();
            } else {
              logger.info('A free address was found at database', JSON.stringify(r));
              return r;
            }
          })
          .then(function(r) {
            freeAddress = r;
            freeAddress.ownerId = ownerId;

            logger.info('Updating the free addess to be owned by the ownerId ', ownerId);
            return addressDAO.update(freeAddress);
          })
          .then(function(r) {
            logger.info('The address now is associated to the ownerId ', ownerId);
            return modelParser.clear(r);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    updateBalance: function(address, availabe, locked) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByAddress(null, entity.address)
          .then(function(addresses) {
            if (addresses) {
              o = modelParser.prepare(entity);
              o.balance.availabe = availabe;
              o.balance.locked = locked;
              o.updatedAt = new Date();
              return addressDAO.update(o);
            } else {
              throw {
                status: 404,
                message: 'The addresses ' + entity.address + ' was not found'
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

    getByAddress: function(ownerId, address) {
      var self = this;

      return new Promise(function(resolve, reject) {
        var filter = {
          address: address
        };

        if (ownerId) {
          filter.ownerId = ownerId;
        }

        self.getAll(filter)
          .then(function(addresses) {
            if (addresses.length) {
              logger.info('Addresses found by address', JSON.stringify(addresses[0]));
              return addresses[0];
            } else {
              return null;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    delete: function(address, ownerId) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.getByAddress(ownerId, address)
          .then(function(addresses) {
            if (!addresses) {
              throw {
                status: 404,
                message: 'Address not found'
              };
            } else {
              address.updatedAt = new Date();
              return addressDAO.disable(addresses.id);
            }
          })
          .then(function(address) {
            return daemonHelper.deleteAddress(address.address);
          })
          .then(resolve)
          .catch(reject);
      });
    }
  };
};
