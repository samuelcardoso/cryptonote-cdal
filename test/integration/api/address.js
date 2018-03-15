var request               = require('supertest');
var AddressBO             = require('../../../src/business/addressBO');
var DAOFactory            = require('../../../src/daos/daoFactory');
var chai                  = require('chai');
var expect                = chai.expect;

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
    this.timeout(5000);

    it('should create a new address', function() {
      return request(server)
        .post('/v1/ownerId/addresses')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(function(res) {
          expect(res.body.ownerId).to.be.equal('ownerId');
          expect(res.body.address).to.be.not.undefined;
          expect(res.body.keys.spendPublicKey).to.be.not.undefined;
          expect(res.body.keys.spendSecretKey).to.be.not.undefined;
          expect(res.body.balance.availabe).to.be.equal(0);
          expect(res.body.balance.locked).to.be.equal(0);
        });
    });

    it('should delete a address', function() {
      this.timeout(5000);

      return request(server)
        .get('/v1/ownerId/addresses')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(function(res) {
          expect(res.body.length).to.be.equal(1);

          return request(server)
            .delete('/v1/ownerId/addresses/' + res.body[0].address)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
        })
        .then(function() {
          return request(server)
            .get('/v1/ownerId/addresses')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
        })
        .then(function(res) {
          expect(res.body.length).to.be.equal(0);
        });
    });
  });
});
