var Promise         = require('promise');
var logger          = require('../config/logger');

module.exports = function(dependencies) {
  var addressDAO = dependencies.addressDAO;
  var modelParser = dependencies.modelParser;
  var daemonHelper = dependencies.daemonHelper;
  var dateHelper = dependencies.dateHelper;

  return {
    dependencies: dependencies,

    clear: function() {
      return new Promise(function(resolve, reject) {
        var chain = Promise.resolve();

        chain
          .then(function() {
            logger.info('[AddressBO] Clearing the database');
            return addressDAO.clear();
          })
          .then(function() {
            logger.info('[AddressBO] The database has been cleared');
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getAll: function(filter) {
      return new Promise(function(resolve, reject) {
        if (!filter) {
          filter = {};
        }

        filter.isEnabled = true;

        logger.info('[AddressBO] Listing all addresses by filter ', JSON.stringify(filter));
        addressDAO.getAll(filter)
          .then(function(r) {
            logger.info('[AddressBO] Total of addresses', r.length);
            return r.map(function(item) {
              return modelParser.clear(item);
            });
          })
          .then(resolve)
          .catch(reject);
      });
    },

    getFreeAddresses: function() {
      logger.info('[AddressBO] Getting free addresses from database');
      return this.getAll({
        isEnabled: true,
        ownerId: null
      });
    },

    createAddressFromDaemon: function(ownerId) {
      var self = this;
      var chain = Promise.resolve();

      return new Promise(function(resolve, reject) {
        chain
          .then(function() {
            logger.info('[AddressBO] Requesting to the daemon a new address');
            return daemonHelper.createAddress();
          })
          .then(function(r) {
            logger.info('[AddressBO] Saving the address and linking to ownerId', ownerId);
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

            logger.info('[AddressBO] Getting keys from the address ', address);
            return daemonHelper.getSpendKeys(address);
          })
          .then(function(r) {
            logger.info('[AddressBO] Returned keys from address ', address, JSON.stringify(r));
            addressEntity.keys = {
              spendPublicKey: r.result.spendPublicKey,
              spendSecretKey: r.result.spendSecretKey
            };

            addressEntity.createdAt = dateHelper.getNow();
            addressEntity.isEnabled = true;
            addressEntity.balance = {
              available: 0,
              locked: 0
            };
            logger.info('[AddressBO] Saving the address to the database', JSON.stringify(addressEntity));
            return addressDAO.save(addressEntity);
          })
          .then(function(r) {
            logger.info('[AddressBO] The address was stored at database successfully', JSON.stringify(r));
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
            logger.info('[AddressBO] Trying to get a free address from database');
            return addressDAO.getFreeAddress();
          })
          .then(function(r) {
            if (!r) {
              logger.info('[AddressBO] There is no free address at database');
              return self.createAddressFromDaemon(ownerId);
            } else {
              logger.info('[AddressBO] A free address was found at database', JSON.stringify(r));
              return modelParser.clear(r);
            }
          })
          .then(function(r) {
            freeAddress = modelParser.prepare(r);
            freeAddress.isEnabled = true;
            freeAddress.ownerId = ownerId;
            freeAddress.updatedAt = dateHelper.getNow();

            logger.info('[AddressBO] Updating the free address to be owned by the ownerId ',
              JSON.stringify(freeAddress));
            return addressDAO.update(freeAddress);
          })
          .then(function(r) {
            logger.info('[AddressBO] The address now is associated to the ownerId ', JSON.stringify(r));
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
            logger.info('[AddressBO] Getting addresses from daemon');
            return daemonHelper.getAddresses();
          })
          .then(function(r) {
            var addresses = r.result.addresses;
            var p = [];

            logger.info('[AddressBO] Addresses returned from daemon', JSON.stringify(addresses));

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
        logger.info('[AddressBO] Trying to get address from database', address);

        chain
          .then(function() {
            return self.getByAddress(null, address);
          })
          .then(function(r) {
            if (r) {
              logger.info('[AddressBO] The address was found at database', address);
              return r;
            } else {
              logger.info('[AddressBO] The address was not found at database. It will be created from daemon', address);
              return self.registerAddressFromDaemon(null, address);
            }
          })
          .then(function(r) {
            addressEntity = r;
            logger.info('[AddressBO] Getting the balance for', address);
            return daemonHelper.getBalance(r.address);
          })
          .then(function(r) {
            logger.info('[AddressBO] Actual balance to the address', addressEntity.address, JSON.stringify(r));

            addressEntity = modelParser.prepare(addressEntity);
            addressEntity.balance.available = r.result.availableBalance;
            addressEntity.balance.locked = r.result.lockedAmount;
            addressEntity.isEnabled = true;
            addressEntity.updatedAt = dateHelper.getNow();
            console.log(addressEntity);
            return addressDAO.update(addressEntity);
          })
          .then(function(r) {
            logger.info('[AddressBO] The balance was updated successfully', JSON.stringify(r));
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

        logger.info('[AddressBO] Getting an address by ownerId/address', ownerId, address);

        self.getAll(filter)
          .then(function(addresses) {
            if (addresses.length) {
              logger.info('[AddressBO] Address found by ownerId/address', JSON.stringify(addresses[0]));
              return addresses[0];
            } else {
              logger.warn('[AddressBO] There is no address to provided informations', ownerId, address);
              return null;
            }
          })
          .then(resolve)
          .catch(reject);
      });
    },

    delete: function(ownerId, address) {
      var self = this;

      return new Promise(function(resolve, reject) {
        logger.info('[AddressBO] Disabling an address', ownerId, address);

        self.getByAddress(ownerId, address)
          .then(function(addresses) {
            if (!addresses) {
              logger.warn('[AddressBO] A error will be thrown. There is no address to the provided informations',
                ownerId, address);
              throw {
                status: 404,
                message: 'The address ' + address + ' not found'
              };
            } else {
              return addressDAO.disable(addresses.id);
            }
          })
          .then(function(address) {
            logger.info('[AddressBO] Address disabled successfully', JSON.stringify(address));
            logger.info('[AddressBO] Trying to delete the address from the daemon');
            return daemonHelper.deleteAddress(address.address);
          })
          .then(function() {
            logger.info('[AddressBO] The address was deleted from daemon successfully', address);
            return true;
          })
          .then(resolve)
          .catch(reject);
      });
    },
  };
};
