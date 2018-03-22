var ConfigurationDAO            = require('./configurationDAO');
var AddressDAO                  = require('./addressDAO');
var TransactionDAO              = require('./transactionDAO');
var TransactionRequestDAO       = require('./transactionRequestDAO');
var BlockchainTransactionDAO    = require('./blockchainTransactionDAO');

module.exports = {
  getDAO: function(dao) {
    switch (dao) {
      case 'transaction':
        return new TransactionDAO();
      case 'transactionRequest':
        return new TransactionRequestDAO();
      case 'blockchainTransaction':
        return new BlockchainTransactionDAO();
      case 'address':
        return new AddressDAO();
      case 'configuration':
        return new ConfigurationDAO();
      default:
        return null;
    }
  }
};
