var request               = require('supertest');
var TransactionBO         = require('../../../src/business/transactionBO');
var AddressBO             = require('../../../src/business/addressBO');
var DAOFactory            = require('../../../src/daos/daoFactory');
var chai                  = require('chai');
var expect                = chai.expect;

describe('api', function(){
  var server;
  var bo = new TransactionBO({
    addressBO: new AddressBO({
      addressDAO: DAOFactory.getDAO('address')
    }),
    transactionDAO: DAOFactory.getDAO('transaction')
  });

  before(function(){
    server = require('../../../src/server');

    return bo.clear();
  });

  after(function(){
    return bo.clear();
  });

  describe('/v1/transactions', function(){
    this.timeout(5000);

    it('should create a new transaction', function() {
      return request(server)
        .post('/v1/ownerId/transactions')
        .send({
          anonymity: 6,
          fee: 1000000,
          paymentId:'',
          addresses:[
            '28eYWfSzMfY1GvxxyrBt3u2bqaLs8tnbCWrWchJWvdpRGqaGDdcqi1aNiPhkhHqyPCT88B1uWdWJAWHnoTpAyjWN9VNeipG'
          ],
          transfers:[
            {
              amount:1000000,
              address:'29ivF7BL7VtE5v2dX1sp4he7S5dcUtzcU1ACB6ZLXdjoCXXbHDseUGufNCezqRpKfLJf5dmANoy6uA2bGtZ3uT5fJKzZjPr'
            }
          ],
          changeAddress:
            '28eYWfSzMfY1GvxxyrBt3u2bqaLs8tnbCWrWchJWvdpRGqaGDdcqi1aNiPhkhHqyPCT88B1uWdWJAWHnoTpAyjWN9VNeipG'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(function(res) {
          expect(res.body.blockIndex).to.not.be.null;
          expect(res.body.timestamp).to.not.be.null;
          expect(res.body.transactionHash).to.not.be.null;
          expect(res.body.anonymity).to.be.equal(6);
          expect(res.body.fee).to.be.equal(1000000);
          expect(res.body.paymentId).to.be.equal('');
          expect(res.body.isConfirmed).to.be.equal(false);
          expect(res.body.isNotified).to.be.equal(false);
          expect(res.body.amount).to.be.equal(-2000000);
          expect(res.body.addresses[0])
            .to
            .be
            .equal('28eYWfSzMfY1GvxxyrBt3u2bqaLs8tnbCWrWchJWvdpRGqaGDdcqi1aNiPhkhHqyPCT88B1uWdWJAWHnoTpAyjWN9VNeipG');
          expect(res.body.changeAddress)
            .to
            .be
            .equal('28eYWfSzMfY1GvxxyrBt3u2bqaLs8tnbCWrWchJWvdpRGqaGDdcqi1aNiPhkhHqyPCT88B1uWdWJAWHnoTpAyjWN9VNeipG');
          expect(res.body.transfers[0].amount).to.be.equal(1000000);
        });
    });
  });
});
