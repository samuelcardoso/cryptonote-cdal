var BOFactory           = require('../business/boFactory');
var BOSWorker           = require('./bosWorker');
var TNSWorker           = require('./tnsWorker');
var AAPMSWorker         = require('./aapmsWorker');
var BOSWorker           = require('./bosWorker');
var DateHelper          = require('../helpers/dateHelper');
var DaemonHelper        = require('../helpers/daemonHelper');
var RequestHelper       = require('../helpers/requestHelper');

module.exports = {
  getWorker: function(woker) {
    switch (woker) {
      case 'aapms':
        return new AAPMSWorker({
          dateHelper: new DateHelper(),
          addressBO: BOFactory.getBO('address'),
          configurationBO: BOFactory.getBO('configuration'),
          daemonHelper: new DaemonHelper({
            requestHelper: new RequestHelper({
              request: require('request')
            }),
            configurationBO: BOFactory.getBO('configuration')
          })
        });
      case 'tns':
        return new TNSWorker({
          dateHelper: new DateHelper(),
          addressBO: BOFactory.getBO('address'),
          transactionBO: BOFactory.getBO('transaction'),
          requestHelper: new RequestHelper({
            request: require('request')
          })
        });
      case 'bos':
        return new BOSWorker({
          dateHelper: new DateHelper(),
          addressBO: BOFactory.getBO('address'),
          transactionBO: BOFactory.getBO('transaction'),
          configurationBO: BOFactory.getBO('configuration'),
          daemonHelper: new DaemonHelper({
            requestHelper: new RequestHelper({
              request: require('request')
            }),
            configurationBO: BOFactory.getBO('configuration')
          })
        });
      default:
        return null;
    }
  }
};
