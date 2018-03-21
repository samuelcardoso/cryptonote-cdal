var ConfigurationBO       = require('../../business/configurationBO');
var DAOFactory            = require('../../daos/daoFactory');
var HTTPResponseHelper    = require('../../helpers/httpResponseHelper');
var ModelParser           = require('../../models/modelParser');
var DateHelper            = require('../../models/dateHelper');

module.exports = function() {
  var business = new ConfigurationBO({
    configurationDAO: DAOFactory.getDAO('configuration'),
    modelParser: new ModelParser(),
    dateHelper: new DateHelper()
  });

  return {
    getAll: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      business.getAll({})
        .then(rh.ok)
        .catch(rh.error);
    },

    update: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      req.body.key = req.params.key;
      business.update(req.body)
        .then(rh.ok)
        .catch(rh.error);
    },

    getByKey: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);
      business.getByKey(req.params.key)
        .then(rh.ok)
        .catch(rh.error);
    }
  };
};
