var request               = require('supertest');
var ConfigurationBO       = require('../../../src/business/configurationBO');
var DAOFactory            = require('../../../src/daos/daoFactory');

describe('api', function(){
  var server;
  var bo = new ConfigurationBO({
    configurationDAO: DAOFactory.getDAO('configuration')
  });

  before(function(){
    server = require('../../../src/server');

    return bo.clear();
  });

  after(function(){
    return bo.clear();
  });

  describe('/v1/configurations', function(){
    it('should list configurations', function() {
      return request(server)
        .get('/v1/configurations')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
