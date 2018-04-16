var BOFactory             = require('../../business/boFactory');
var HTTPResponseHelper    = require('../../helpers/httpResponseHelper');

module.exports = function() {
  var business = BOFactory.getBO('configuration');

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
