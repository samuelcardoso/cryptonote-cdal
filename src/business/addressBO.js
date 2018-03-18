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

    createAddressFromDaemon: function(ownerId) {
      var self = this;
      var chain = Promise.resolve();

      return new Promise(function(resolve, reject) {
        chain
          .then(function() {
            logger.info('Requesting to the daemon a new address');
            return daemonHelper.createAddress();
          })
          .then(function(r) {
            return self.registerAddressFromDaemon(ownerId, r.result.address);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    registerAddressFromDaemon: function(ownerId, address) {
      var chain = Promise.resolve();
      var addressEntity = null;

      return new Promise(function(resolve, reject) {
        chain
          .then(function() {
            addressEntity = {
              ownerId: ownerId,
              address: address
            };

            logger.info('Getting keys from the address ', address);
            return daemonHelper.getSpendKeys(address);
          })
          .then(function(r) {
            logger.info('Returned keys from address ', address, JSON.stringify(r));
            addressEntity.keys = {
              spendPublicKey: r.result.spendPublicKey,
              spendSecretKey: r.result.spendSecretKey
            };

            addressEntity.createdAt = new Date();
            addressEntity.isEnabled = true;
            addressEntity.balance = {
              availabe: 0,
              locked: 0
            };

            return addressDAO.save(addressEntity);
          })
          .then(function(r) {
            return modelParser.clear(r);
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

    updateWalletBalance: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        chain
          .then(function() {
            logger.info('Getting addresses from daemon');
            return daemonHelper.getAddresses();
          })
          .then(function(r) {
            var addresses = r.result.addresses;
            var p = [];

            logger.info('Addresses returned from daemon', JSON.stringify(addresses.length));

            for (var i = 0; i < addresses.length; i++) {
              p.push(self.updateBalance(addresses[i]));
            }

            return Promise.all(p);
          })
          .then(resolve)
          .catch(reject);
      });
    },

    updateBalance: function(address) {
      var self = this;
      var addressEntity = null;

      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();
        logger.info('Trying to get address from database', address);

        chain
          .then(function() {
            return self.getByAddress(null, address);
          })
          .then(function(r) {
            if (r) {
              logger.info('The address was found at database', address);
              return r;
            } else {
              logger.info('The address was not found at database. It will be created from daemon', address);
              return self.registerAddressFromDaemon(null, address);
            }
          })
          .then(function(r) {
            addressEntity = r;
            logger.info('Getting the balance', address.address);
            return daemonHelper.getBalance(r.address);
          })
          .then(function(r) {
            logger.info('Actual balance to the address', addressEntity.address, JSON.stringify(r));

            addressEntity = modelParser.prepare(addressEntity);
            addressEntity.balance.availabe = r.result.availableBalance;
            addressEntity.balance.lockedAmount = r.result.lockedAmount;
            addressEntity.updatedAt = new Date();

            return addressDAO.update(addressEntity);
          })
          .then(function(r) {
            logger.info('The balance was updated successfully', JSON.stringify(r));
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
    },
  };
};
