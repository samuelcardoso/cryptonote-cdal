var BOFactory             = require('../../business/boFactory');
var HTTPResponseHelper    = require('../../helpers/httpResponseHelper');

module.exports = function() {
  var business = BOFactory.getBO('transaction');

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

    getAll: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);

      var filter = {};

      if (req.params.ownerId) {
        filter.ownerId = req.params.ownerId;
      }

      if (req.params.address) {
        filter.address = req.params.address;
      }

      if (req.params.id) {
        filter._id = req.params.id;
      }

      business.getAll(filter)
        .then(function(r) {
          if (req.params.id) {
            if (r.length > 0) {
              rh.ok(r[0]);
            } else {
              rh.ok(null);
            }
          } else {
            rh.ok(r);
          }
        })
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

      if (req.params.address) {
        req.body.addresses = [req.params.address];
      }
      business.save(req.body)
        .then(rh.ok)
        .catch(rh.error);
    },

    getBlockchainTransactionByTransaction: function(req, res) {
      var rh = new HTTPResponseHelper(req, res);

      var filter = {};

      if (req.params.ownerId) {
        filter.ownerId = req.params.ownerId;
      }

      if (req.params.address) {
        filter.address = req.params.address;
      }

      if (req.params.id) {
        filter._id = req.params.id;
      }

      business.getBlockchainTransactionByTransaction(filter)
        .then(rh.ok)
        .catch(rh.error);
    }
  };
};
