var request               = require('supertest');
var AddressBO             = require('../../../src/business/addressBO');
var DAOFactory            = require('../../../src/daos/daoFactory');

describe('api', function(){
  var server;
  var bo = new AddressBO({
    addressDAO: DAOFactory.getDAO('address')
  });

  console.log(bo.dependencies.daemonHelper);

  before(function(){
    server = require('../../../src/server');

    return bo.clear();
  });

  after(function(){
    return bo.clear();
  });

  describe('/v1/addresses', function(){
    it('should create a new address', function() {
      return request(server)
        .post('/v1/ownerId/addresses')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(function(res) {
          console.log(res.body);
        });
    });
  });
});
