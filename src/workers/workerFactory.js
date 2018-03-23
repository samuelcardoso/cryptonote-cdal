var BOFactory           = require('../business/boFactory');
var BOSWorker           = require('./bosWorker');
var AAPMSWorker         = require('./aapmsWorker');
var BOSWorker           = require('./bosWorker');
var DateHelper          = require('../helpers/dateHelper');
var DaemonHelper        = require('../helpers/daemonHelper');
var RequestHelper       = require('../helpers/requestHelper');

module.exports = {
  getWorker: function(dao) {
    switch (dao) {
      case 'aapms':
        return new AAPMSWorker({
          dateHelper: new DateHelper(),
          addressBO: BOFactory.getBO('address'),
          configurationBO: BOFactory.getBO('configuration'),
          daemonHelper: new DaemonHelper({
            requestHelper: new RequestHelper({
              request: require('request')
            })
          })
        });;
      case 'bos':
        return new BOSWorker({
          dateHelper: new DateHelper(),
          addressBO: BOFactory.getBO('address'),
          transactionBO: BOFactory.getBO('transaction'),
          configurationBO: BOFactory.getBO('configuration'),
          daemonHelper: new DaemonHelper({
            requestHelper: new RequestHelper({
              request: require('request')
            })
          })
        }, true);
      default:
        return null;
    }
  }
};
