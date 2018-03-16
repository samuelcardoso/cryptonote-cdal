var ConfigurationDAO    = require('./configurationDAO');
var AddressDAO          = require('./addressDAO');
var TransactionDAO      = require('./transactionDAO');

module.exports = {
  getDAO: function(dao) {
    switch (dao) {
      case 'transaction':
        return new TransactionDAO();
      case 'address':
        return new AddressDAO();
      case 'configuration':
        return new ConfigurationDAO();
      default:
        return null;
    }
  }
};
