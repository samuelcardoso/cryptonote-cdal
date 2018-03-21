var TransactionBO     = require('../../../src/business/transactionBO');
var AddressBO         = require('../../../src/business/addressBO');
var ModelParser       = require('../../../src/models/modelParser');
var DaemonHelper      = require('../../../src/helpers/daemonHelper');
var DateHelper        = require('../../../src/helpers/dateHelper');
var DAOFactory        = require('../../../src/daos/daoFactory');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('Business > TransactionBO > ', function() {
  var transactionDAO = DAOFactory.getDAO('transaction');
  var addressDAO = DAOFactory.getDAO('address');
  var dateHelper = new DateHelper();
  var modelParser = new ModelParser();
  var addressBO = new AddressBO({});
  var daemonHelper = new DaemonHelper({});

  var transactionBO = new TransactionBO({
    transactionDAO: transactionDAO,
    addressBO: addressBO,
    addressDAO: addressDAO,
    modelParser: modelParser,
    dateHelper: dateHelper,
    daemonHelper: daemonHelper
  });

  describe('Methods > ', function() {
    it('clear', function() {
      var clearStub = sinon.stub(transactionDAO, 'clear');
      clearStub
        .withArgs()
        .returns(Promise.resolve());

      return transactionBO.clear()
        .then(function(){
          expect(clearStub.callCount).to.be.equal(1);
          clearStub.restore();
        });
    });

    it('getAll', function() {
      var getAllStub = sinon.stub(transactionDAO, 'getAll');
      getAllStub
        .withArgs({isEnabled: true})
        .returns(Promise.resolve([]));

      return transactionBO.getAll()
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);

          getAllStub.restore();
        });
    });

    it('save', function() {
      var now = new Date();
      dateHelper.setNow(now);

      var sendTransactionStub = sinon.stub(daemonHelper, 'sendTransaction');
      sendTransactionStub
        .withArgs(
          6, //entity.anonymity,
          1000000, //entity.fee,
          0,
          'PAYMENT_ID', //entity.paymentId,
          ['ADDRESS1', 'ADDRESS2'], //entity.addresses,
          [{
            amount: 100000000,
            address: 'ADDRESS3'
          }, {
            amount: 100000000,
            address: 'ADDRESS4'
          }], //entity.transfers,
          'ADDRESS1' //entity.changeAddress
        )
        .returns(Promise.resolve({
          result: {
            transactionHash: 'transactionHash'
          }
        }));

      var getTransactionStub = sinon.stub(daemonHelper, 'getTransaction');
      getTransactionStub
        .withArgs('transactionHash')
        .returns(Promise.resolve({
          result: {
            transaction: {
              blockIndex: 1,
              timestamp: 2,
              amount: 3
            }
          }
        }));

      var saveStub = sinon.stub(transactionDAO, 'save');
      saveStub
        .withArgs({
          ownerId: 'ownerId',
          anonymity: 6,
          fee: 1000000,
          paymentId: 'PAYMENT_ID',
          addresses: ['ADDRESS1', 'ADDRESS2'],
          transfers: [{
            amount: 100000000,
            address: 'ADDRESS3'
          }, {
            amount: 100000000,
            address: 'ADDRESS4'
          }],
          changeAddress: 'ADDRESS1',
          transactionHash: 'transactionHash',
          createdAt: now,
          isConfirmed: false,
          isNotified: false,
          blockIndex: 1,
          timestamp: 2,
          amount: 3
        })
        .returns(Promise.resolve({
          _id: 'ID',
          ownerId: 'ownerId',
          anonymity: 6,
          fee: 1000000,
          paymentId: 'PAYMENT_ID',
          addresses: ['ADDRESS1', 'ADDRESS2'],
          transfers: [{
            amount: 100000000,
            address: 'ADDRESS3'
          }, {
            amount: 100000000,
            address: 'ADDRESS4'
          }],
          changeAddress: 'ADDRESS1',
          transactionHash: 'transactionHash',
          createdAt: now,
          isConfirmed: false,
          isNotified: false,
          blockIndex: 1,
          timestamp: 2,
          amount: 3
        }));

      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({address: 'ADDRESS1',  isEnabled: true})
        .returns(Promise.resolve([{
          address:'ADDRESS1'
        }]));
      getAllStub
        .withArgs({address: 'ADDRESS2',  isEnabled: true})
        .returns(Promise.resolve([]));

      var registerAddressFromDaemonStub = sinon.stub(addressBO, 'registerAddressFromDaemon');
      registerAddressFromDaemonStub
        .withArgs('ownerId', 'ADDRESS2')
        .returns(Promise.resolve({
          address:'ADDRESS2'
        }));

      var updateBalanceStub = sinon.stub(addressBO, 'updateBalance');
      updateBalanceStub
        .withArgs('ADDRESS1')
        .returns(Promise.resolve());
      updateBalanceStub
        .withArgs('ADDRESS2')
        .returns(Promise.resolve());

      return transactionBO.save({
        ownerId: 'ownerId',
        anonymity: 6,
        fee: 1000000,
        paymentId: 'PAYMENT_ID',
        addresses: ['ADDRESS1', 'ADDRESS2'],
        transfers: [{
          amount: 100000000,
          address: 'ADDRESS3'
        }, {
          amount: 100000000,
          address: 'ADDRESS4'
        }],
        changeAddress: 'ADDRESS1'
      })
        .then(function(r){
          expect(r).to.be.deep.equal({
            id: 'ID',
            ownerId: 'ownerId',
            anonymity: 6,
            fee: 1000000,
            paymentId: 'PAYMENT_ID',
            addresses: ['ADDRESS1', 'ADDRESS2'],
            transfers: [{
              amount: 100000000,
              address: 'ADDRESS3'
            }, {
              amount: 100000000,
              address: 'ADDRESS4'
            }],
            changeAddress: 'ADDRESS1',
            transactionHash: 'transactionHash',
            createdAt: now,
            isConfirmed: false,
            isNotified: false,
            blockIndex: 1,
            timestamp: 2,
            amount: 3
          });
          expect(sendTransactionStub.callCount).to.be.equal(1);
          expect(getTransactionStub.callCount).to.be.equal(1);
          expect(saveStub.callCount).to.be.equal(1);
          expect(getAllStub.callCount).to.be.equal(2);
          expect(registerAddressFromDaemonStub.callCount).to.be.equal(1);
          expect(updateBalanceStub.callCount).to.be.equal(2);

          sendTransactionStub.restore();
          getTransactionStub.restore();
          saveStub.restore();
          getAllStub.restore();
          registerAddressFromDaemonStub.restore();
          updateBalanceStub.restore();
        });
    });
  });
});
