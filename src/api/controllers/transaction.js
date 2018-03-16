var TransactionBO         = require('../../business/transactionBO');
var AddressBO             = require('../../business/addressBO');
var DAOFactory            = require('../../daos/daoFactory');
var HTTPResponseHelper    = require('../../helpers/httpResponseHelper');
var ModelParser           = require('../../models/modelParser');
var DaemonHelper          = require('../../helpers/daemonHelper');
var RequestHelper         = require('../../helpers/requestHelper');

module.exports = function() {
  var addressBO = new AddressBO({
    addressDAO: DAOFactory.getDAO('address'),
    modelParser: new ModelParser(),
    daemonHelper: new DaemonHelper({
      requestHelper: new RequestHelper({
        request: require('request')
      })
    })
  });

  var business = new TransactionBO({
    addressBO: addressBO,
    transactionDAO: DAOFactory.getDAO('transaction'),
    modelParser: new ModelParser(),
    daemonHelper: new DaemonHelper({
      requestHelper: new RequestHelper({
        request: require('request')
      })
    })
  });

  return {
    getAll: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      business.getAll({})
        .then(rh.ok)
        .catch(rh.error);
    },

    getAllByOwnerId: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      business.getAll({ownerId: req.params.ownerId})
        .then(rh.ok)
        .catch(rh.error);
    },

    update: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      req.body.key = req.params.key;

      if (req.params.ownerId) {
        req.body.ownerId = req.params.ownerId;
      }

      business.update(req.body)
        .then(rh.ok)
        .catch(rh.error);
    },

    save: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      req.body.ownerId = req.params.ownerId;
      business.save(req.body)
        .then(rh.ok)
        .catch(rh.error);
    },

    getByTransactionHash: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);

      business.getByAddress(req.params.ownerId, req.params.transactionHash)
        .then(rh.ok)
        .catch(rh.error);
    }
  };
};
