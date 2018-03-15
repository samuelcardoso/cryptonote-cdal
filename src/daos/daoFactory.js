var ConfigurationDAO    = require('./configurationDAO');
var AddressDAO          = require('./addressDAO');

module.exports = {
  getDAO: function(dao) {
    switch (dao) {
      case 'address':
        return new AddressDAO();
      case 'configuration':
        return new ConfigurationDAO();
      default:
        return null;
    }
  }
};
