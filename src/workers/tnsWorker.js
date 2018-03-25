var Promise         = require('promise');
var logger          = require('../config/logger');
var settings        = require('../config/settings');

module.exports = function(dependencies, autoRun) {
  var transactionBO = dependencies.transactionBO;
  var addressBO = dependencies.addressBO;
  var requestHelper = dependencies.requestHelper;

  return {
    dependencies: dependencies,
    autoRun: autoRun,
    transactionNotificationAPI: settings.transactionNotificationAPI,

    run: function() {
      return this.notifyConfirmedTransactions();
    },

    notifyConfirmedTransactions: function() {
      var self = this;
      var chain = Promise.resolve();
      var addresses = [];
      var transactions = null;

      return new Promise(function(resolve) {
        logger.info('[TNSWorker] Starting Transaction Notifier Service');

        chain
          .then(function() {
            logger.info('[TNSWorker] Getting unnotified transactions from database');
            return transactionBO.getTransactionsToNotify();
          })
          .then(function(r) {
            logger.info('[TNSWorker] Returned unnotified transactions from database', JSON.stringify(r));
            transactions = r;

            for (var i = 0; i < r.length; i++) {
              logger.info('[TNSWorker] Checking if the address is listed to have balance updated', r[i].address);
              if (addresses.indexOf(r[i].address) === -1) {
                logger.info('[TNSWorker] The address is listed to have balance updated', r[i].address);
                addresses.push(r[i].address);
              }
            }

            var p = [];

            logger.info('[TNSWorker] Updating the balance for the involved addresses', JSON.stringify(addresses));
            for (var j = 0; j < addresses.length; j++) {
              p.push(addressBO.updateBalance(addresses[j]));
            }

            logger.debug('[TNSWorker] Returning promises', p.length);
            return Promise.all(p);
          })
          .then(function() {
            var p = [];

            logger.info('[TNSWorker] Sending the notifications about transactions');

            for (var i = 0; i < transactions.length; i++) {
              logger.info('[TNSWorker] Notifiyng about the transaction', transactions[i]);
              p.push(requestHelper.postJSON(
                self.transactionNotificationAPI.endpoint,
                [],
                transactions[i],
                []));
            }

            return Promise.all(p);
          })
          .then(function() {
            var p = [];

            logger.info('[TNSWorker] Updating the flag is notified for the transactions', transactions.length);

            for (var i = 0; i < transactions.length; i++) {
              if (!transactions[i].notifications.creation.isNotified) {
                logger.info('[TNSWorker] Updating the flag notifications.confirmation.isNotified for the transaction', transactions[i].id);
                p.push(transactionBO.updateIsCreationNotifiedFlag(transactions[i].id));
              } else {
                logger.info('[TNSWorker] Updating the flag notifications.confirmation.isNotified for the transaction', transactions[i].id);
                p.push(transactionBO.updateIsConfirmationNotifiedFlag(transactions[i].id));
              }
            }

            logger.debug('[TNSWorker] Returning promises', p.length);
            return Promise.all(p);
          })
          .then(function() {
            logger.info('[TNSWorker] A new verification will occurr in 10s');
            setTimeout(function() {
              self.notifyConfirmedTransactions();
            }, 10 * 1000);

            resolve(true);
          })
          .catch(function(r) {
            logger.error('[TNSWorker] An error has occurred while notifying unnotified transactions', JSON.stringify(r));

            logger.info('[TNSWorker] A new verification will occurr in 10s');
            setTimeout(function() {
              self.notifyConfirmedTransactions();
            }, 10 * 1000);

            resolve(true);
          });
      });
    }
  };
};
