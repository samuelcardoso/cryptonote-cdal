var TransactionBO               = require('./transactionBO');
var AddressBO                   = require('./addressBO');
var ConfigurationBO             = require('./configurationBO');
var DAOFactory                  = require('../daos/daoFactory');
var ModelParser                 = require('../models/modelParser');
var DaemonHelper                = require('../helpers/daemonHelper');
var RequestHelper               = require('../helpers/requestHelper');
var DateHelper                  = require('../helpers/dateHelper');

function factory(dao) {
  switch (dao) {
    case 'configuration':
      return new ConfigurationBO({
        configurationDAO: DAOFactory.getDAO('configuration'),
        modelParser: new ModelParser(),
        dateHelper: new DateHelper()
      });
    case 'transaction':
      return new TransactionBO({
        addressBO: factory('address'),
        addressDAO: DAOFactory.getDAO('address'),
        transactionDAO: DAOFactory.getDAO('transaction'),
        transactionRequestDAO: DAOFactory.getDAO('transactionRequest'),
        blockchainTransactionDAO: DAOFactory.getDAO('blockchainTransaction'),
        modelParser: new ModelParser(),
        daemonHelper: new DaemonHelper({
          requestHelper: new RequestHelper({
            request: require('request')
          })
        }),
        dateHelper: new DateHelper()
      });
    case 'address':
      return new AddressBO({
        addressDAO: DAOFactory.getDAO('address'),
        modelParser: new ModelParser(),
        dateHelper: new DateHelper(),
        daemonHelper: new DaemonHelper({
          requestHelper: new RequestHelper({
            request: require('request')
          })
        })
      });
    default:
      return null;
  }
};

module.exports = {getBO: factory};
