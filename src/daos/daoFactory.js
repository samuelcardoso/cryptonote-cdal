var ConfigurationDAO    = require('./configurationDAO');

module.exports = {
  getDAO: function(dao) {
    switch (dao) {
      case 'configuration':
        return new ConfigurationDAO();
      default:
        return null;
    }
  }
};
