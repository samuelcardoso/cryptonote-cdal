var AddressBO             = require('../../business/addressBO');
var ConfigurationBO       = require('../../business/configurationBO');
var DAOFactory            = require('../../daos/daoFactory');
var HTTPResponseHelper    = require('../../helpers/httpResponseHelper');
var ModelParser           = require('../../models/modelParser');
var DaemonHelper          = require('../../helpers/daemonHelper');
var DateHelper            = require('../../helpers/dateHelper');
var RequestHelper         = require('../../helpers/requestHelper');
var AAPMSWorker           = require('../../workers/aapmsWorker');

module.exports = function() {
  var business = new AddressBO({
    addressDAO: DAOFactory.getDAO('address'),
    modelParser: new ModelParser(),
    dateHelper: new DateHelper(),
    daemonHelper: new DaemonHelper({
      requestHelper: new RequestHelper({
        request: require('request')
      })
    })
  });

  var configurationBO = new ConfigurationBO({
    configurationDAO: DAOFactory.getDAO('configuration'),
    modelParser: new ModelParser()
  });

  var aapmsWorker = new AAPMSWorker({
    addressBO: business,
    configurationBO: configurationBO
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

    createAddress: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      business.createAddress(req.params.ownerId)
        .then(function(r) {
          rh.created(r);

          //this process will occurs in a diferent thread, just to maintain the
          //the pool with a good amount of availabe addresses
          aapmsWorker.run();
        })
        .catch(rh.error);
    },

    getByAddress: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);

      business.getByAddress(req.params.ownerId, req.params.address)
        .then(rh.ok)
        .catch(rh.error);
    },

    delete: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);

      business.delete(req.params.ownerId, req.params.address)
        .then(rh.ok)
        .catch(rh.error);
    },
  };
};
