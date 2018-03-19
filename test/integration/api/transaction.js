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
          fee: 1000,
          paymentId:'',
          addresses:[
            'N8JvJBfQCVY67X7GAq4sr15XAvKG6chyZjks2e1HD5S3VWrzqarixLvKuRtspmiqCjauGzK6wD2Fzc31CbHLqisBUMYzmqV'
          ],
          transfers:[
            {
              amount:10000,
              address:'NCkUc6frUEFL5B2eaoq5HUMCy1iCwgdwoYTJSPqUZ3eYKd2yJfiEnRYUdhThUyKVWgaFMBYSbALaidotRTPqwvyR6S5XwZx'
            }
          ],
          changeAddress:
            'N8JvJBfQCVY67X7GAq4sr15XAvKG6chyZjks2e1HD5S3VWrzqarixLvKuRtspmiqCjauGzK6wD2Fzc31CbHLqisBUMYzmqV'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(function(res) {
          expect(res.body.blockIndex).to.not.be.null;
          expect(res.body.timestamp).to.not.be.null;
          expect(res.body.transactionHash).to.not.be.null;
          expect(res.body.anonymity).to.be.equal(6);
          expect(res.body.fee).to.be.equal(1000);
          expect(res.body.paymentId).to.be.equal('');
          expect(res.body.isConfirmed).to.be.equal(false);
          expect(res.body.isNotified).to.be.equal(false);
          expect(res.body.amount).to.be.equal(-11000);
          expect(res.body.addresses[0])
            .to
            .be
            .equal('N8JvJBfQCVY67X7GAq4sr15XAvKG6chyZjks2e1HD5S3VWrzqarixLvKuRtspmiqCjauGzK6wD2Fzc31CbHLqisBUMYzmqV');
          expect(res.body.changeAddress)
            .to
            .be
            .equal('N8JvJBfQCVY67X7GAq4sr15XAvKG6chyZjks2e1HD5S3VWrzqarixLvKuRtspmiqCjauGzK6wD2Fzc31CbHLqisBUMYzmqV');
          expect(res.body.transfers[0].amount).to.be.equal(1000);
        });
    });
  });
});
