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
  var transactionRequestDAO = DAOFactory.getDAO('transactionRequest');
  var blockchainTransactionDAO = DAOFactory.getDAO('blockchainTransaction');
  var addressDAO = DAOFactory.getDAO('address');
  var dateHelper = new DateHelper();
  var modelParser = new ModelParser();
  var addressBO = new AddressBO({});
  var daemonHelper = new DaemonHelper({});

  var transactionBO = new TransactionBO({
    transactionRequestDAO: transactionRequestDAO,
    blockchainTransactionDAO: blockchainTransactionDAO,
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
        .withArgs({})
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

      var transactionRequestSaveStub = sinon.stub(transactionRequestDAO, 'save');
      transactionRequestSaveStub
        .withArgs({
          ownerId: 'ownerId',
          transactionOwnerId: 'transactionOwnerId',
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
          status: 0,
          createdAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          ownerId: 'ownerId',
          transactionOwnerId: 'transactionOwnerId',
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
          status: 0,
          createdAt: now
        }));

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

      var transactionRequestUpdateStub = sinon.stub(transactionRequestDAO, 'update');
      transactionRequestUpdateStub
        .withArgs({
          _id: 'ID',
          ownerId: 'ownerId',
          transactionOwnerId: 'transactionOwnerId',
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
          status: 0,
          createdAt: now,
          transactionHash: 'transactionHash',
          updatedAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          ownerId: 'ownerId',
          transactionOwnerId: 'transactionOwnerId',
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
          status: 0,
          createdAt: now,
          transactionHash: 'transactionHash',
          updatedAt: now
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

      var blockchainTransactionSaveStub = sinon.stub(blockchainTransactionDAO, 'save');
      blockchainTransactionSaveStub
        .withArgs({
          blockIndex: 1,
          timestamp: 2,
          amount: 3
        })
        .returns(Promise.resolve({
          _id: 'ID',
          blockIndex: 1,
          timestamp: 2,
          amount: 3
        }));

      var getAllStub = sinon.stub(addressBO, 'getAll');
      getAllStub
        .withArgs({address: 'ADDRESS1'})
        .returns(Promise.resolve([{
          address:'ADDRESS1'
        }]));
      getAllStub
        .withArgs({address: 'ADDRESS2'})
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
        transactionOwnerId: 'transactionOwnerId',
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
            transactionOwnerId: 'transactionOwnerId',
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
            status: 1,
            createdAt: now,
            transactionHash: 'transactionHash',
            updatedAt: now
          });
          expect(transactionRequestSaveStub.callCount).to.be.equal(1);
          expect(transactionRequestUpdateStub.callCount).to.be.equal(1);
          expect(blockchainTransactionSaveStub.callCount).to.be.equal(1);
          expect(sendTransactionStub.callCount).to.be.equal(1);
          expect(getTransactionStub.callCount).to.be.equal(1);
          expect(getAllStub.callCount).to.be.equal(2);
          expect(registerAddressFromDaemonStub.callCount).to.be.equal(1);
          expect(updateBalanceStub.callCount).to.be.equal(2);

          transactionRequestSaveStub.restore();
          transactionRequestUpdateStub.restore();
          blockchainTransactionSaveStub.restore();
          sendTransactionStub.restore();
          getTransactionStub.restore();
          getAllStub.restore();
          registerAddressFromDaemonStub.restore();
          updateBalanceStub.restore();
        });
    });

    /*it('getByTransactionHash', function() {
      var getAll = sinon.stub(transactionDAO, 'getAll');
      getAll
        .withArgs({
          ownerId: 'ownerId',
          transactionHash: 'transactionHash'
        })
        .returns(Promise.resolve([]));

      return transactionBO.getByTransactionHash('ownerId', 'transactionHash')
        .then(function(r){
          expect(r).to.be.null;
          expect(getAll.callCount).to.be.equal(1);
          getAll.restore();
        });
    });*/

    it('parseTransaction - transaction not found', function() {
      var now = new Date();
      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var getAll = sinon.stub(blockchainTransactionDAO, 'getAll');
      getAll
        .withArgs({
          transactionHash: 'transactionHash'
        })
        .returns(Promise.resolve([]));

      var saveStub = sinon.stub(blockchainTransactionDAO, 'save');
      saveStub
        .withArgs({
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2,
          createdAt: now,
          isEnabled: true
        })
        .returns(Promise.resolve({
          _id: 'ID',
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2,
          createdAt: now
        }));

      return transactionBO.parseTransaction({
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2
        })
        .then(function(r){
          expect(r).to.be.deep.equal({
            id: 'ID',
            blockIndex: 1,
            timestamp: 2,
            transactionHash: 'transactionHash',
            createdAt: now
          });
          expect(getNowStub.callCount).to.be.equal(1);
          expect(getAll.callCount).to.be.equal(1);
          expect(saveStub.callCount).to.be.equal(1);
          getNowStub.restore();
          getAll.restore();
          saveStub.restore();
        });
    });

    it('parseTransaction - transaction found', function() {
      var now = new Date();
      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var getAll = sinon.stub(blockchainTransactionDAO, 'getAll');
      getAll
        .withArgs({
          transactionHash: 'transactionHash'
        })
        .returns(Promise.resolve([{
          id: 'ID',
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2,
          createdAt: now,
          updatedAt: now
        }]));

      var saveStub = sinon.stub(blockchainTransactionDAO, 'update');
      saveStub
        .withArgs({
          _id: 'ID',
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2,
          createdAt: now,
          updatedAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2,
          createdAt: now,
          updatedAt: now
        }));

      return transactionBO.parseTransaction({
          transactionHash: 'transactionHash',
          blockIndex: 1,
          timestamp: 2
        })
        .then(function(r){
          expect(r).to.be.deep.equal({
            id: 'ID',
            createdAt: now,
            blockIndex: 1,
            timestamp: 2,
            transactionHash: 'transactionHash',
            updatedAt: now
          });
          expect(getNowStub.callCount).to.be.equal(1);
          expect(getAll.callCount).to.be.equal(1);
          expect(saveStub.callCount).to.be.equal(1);
          getNowStub.restore();
          getAll.restore();
          saveStub.restore();
        });
    });

    it('updateIsConfirmedFlag', function() {
      var updateIsConfirmedFlagStub = sinon.stub(transactionDAO, 'updateIsConfirmedFlag');
      updateIsConfirmedFlagStub
        .withArgs(1)
        .returns(Promise.resolve());

      return transactionBO.updateIsConfirmedFlag(1)
        .then(function(){
          expect(updateIsConfirmedFlagStub.callCount).to.be.equal(1);
          updateIsConfirmedFlagStub.restore();
        });
    });
  });
});
