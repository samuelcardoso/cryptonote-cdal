var DaemonHelper      = require('../../../src/helpers/daemonHelper');
var TransactionBO     = require('../../../src/business/transactionBO');
var AddressBO         = require('../../../src/business/addressBO');
var ConfigurationBO   = require('../../../src/business/configurationBO');
var BOSWorker         = require('../../../src/workers/bosWorker');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('Workers > BOSWorker', function() {
  var daemonHelper = new DaemonHelper({});
  var transactionBO = new TransactionBO({});
  var addressBO = new AddressBO({});
  var configurationBO = new ConfigurationBO({});

  var bosWorker = new BOSWorker({
    daemonHelper: daemonHelper,
    transactionBO: transactionBO,
    addressBO: addressBO,
    configurationBO: configurationBO
  }, false);

  var getByKeyStub = sinon.stub(configurationBO, 'getByKey');
  getByKeyStub
    .withArgs('currentBlockIndex')
    .returns(Promise.resolve({
      key: 'currentBlockIndex',
      value: 0
    }));
  getByKeyStub
    .withArgs('defaultTransactionsBlockCount')
    .returns(Promise.resolve({
      key: 'defaultTransactionsBlockCount',
      value: 10000
    }));

  getByKeyStub
    .withArgs('minimumConfirmations')
    .returns(Promise.resolve({
      key: 'minimumConfirmations',
      value: 3
    }));

  var updateWalletBalanceStub = sinon.stub(addressBO, 'updateWalletBalance');
  updateWalletBalanceStub
    .withArgs()
    .returns(Promise.resolve());

  it('should run', function() {
    var getUnconfirmedTransactionHashesStub = sinon.stub(daemonHelper, 'getUnconfirmedTransactionHashes');
    getUnconfirmedTransactionHashesStub
      .withArgs()
      .returns(Promise.resolve({
        result: {
          transactionHashes: ['HASH1']
        }
      }));

    var getTransactionStub = sinon.stub(daemonHelper, 'getTransaction');
    getTransactionStub
      .withArgs('HASH1')
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var parseTransactionStub = sinon.stub(transactionBO, 'parseTransaction');
    parseTransactionStub
      .withArgs({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      })
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var getStatusStub = sinon.stub(daemonHelper, 'getStatus');
    getStatusStub
      .withArgs()
      .returns(Promise.resolve({
        id: 'test',
        jsonrpc: '2.0',
        result:{
          blockCount: 63667,
          knownBlockCount: 63667,
          lastBlockHash: 'bf95d3a66d2b23c5bca14aa5274ade97c024f8196285ad4654e5e699d195cde2',
          peerCount:76
        }
      }));

      var t1 = {
        amount: 47400000,
        blockIndex: 63545,
        confirmations: 122,
        extra: '',
        fee: 1000,
        isBase: false,
        paymentId: '',
        state: 0,
        timestamp: 1521369392,
        transactionHash: 'transactionHash',
        transfers: [{
          address: 'address',
          amount: 47400000,
          type: 0
        }, {
          address: '',
          amount: -600000000,
          type: 0
        }, {
          address: '',
          amount: 552599000,
          type: 0
        }],
        unlockTime: 0
      };

      var t2 = {
        amount: 3000000000,
        blockIndex: 63545,
        confirmations: 122,
        extra: '',
        fee: 10000,
        isBase: false,
        paymentId: 'paymentId',
        state: 0,
        timestamp: 1521369392,
        transactionHash: 'transactionHash',
        transfers: [{
          address: 'address',
          amount: 3000000000,
          type: 0
        }, {
          address: '',
          amount: -3057000000,
          type: 0
        }, {
          address: '',
          amount: 56990000,
          type: 0
        }],
        unlockTime: 0
      };

    var getTransactionsStub = sinon.stub(daemonHelper, 'getTransactions');
    getTransactionsStub
      .withArgs(0, 10000)
      .returns(Promise.resolve({
        id: 'test',
        jsonrpc: '2.0',
        result: {
          items: [{
            blockHash: 'blockHash',
            transactions: [t1, t2]
          }]
        }
      }));

    getTransactionsStub
      .withArgs(0, 1)
      .returns(Promise.resolve({
        id: 'test',
        jsonrpc: '2.0',
        result: {
          items: [{
            blockHash: 'blockHash',
            transactions: []
          }]
        }
      }));

    parseTransactionStub
      .withArgs(t1)
      .returns(Promise.resolve(t1));
    parseTransactionStub
      .withArgs(t2)
      .returns(Promise.resolve(t2));

    var updateStub = sinon.stub(configurationBO, 'update');
    updateStub
      .withArgs({
        key: 'currentBlockIndex',
        value: 9999
      })
      .returns(Promise.resolve({
        key: 'currentBlockIndex',
        value: 9999
      }));

    var updateIsConfirmedFlagStub = sinon.stub(transactionBO, 'updateIsConfirmedFlag');
    updateIsConfirmedFlagStub
    .withArgs(-3)
    .returns(Promise.resolve());

    return bosWorker.run()
      .then(function(r) {
        expect(getUnconfirmedTransactionHashesStub.callCount).to.be.equal(1);
        expect(getTransactionStub.callCount).to.be.equal(1);
        expect(getStatusStub.callCount).to.be.equal(1);
        expect(parseTransactionStub.callCount).to.be.equal(3);
        expect(updateStub.callCount).to.be.equal(1);
        expect(r).to.be.true;

        getUnconfirmedTransactionHashesStub.restore();
        getTransactionStub.restore();
        getTransactionsStub.restore();
        getStatusStub.restore();
        parseTransactionStub.restore();
        updateStub.restore();
      });
  });

  it('should not crach when the daemon (getStatus) returns an error', function() {
    var getUnconfirmedTransactionHashesStub = sinon.stub(daemonHelper, 'getUnconfirmedTransactionHashes');
    getUnconfirmedTransactionHashesStub
      .withArgs()
      .returns(Promise.resolve({
        result: {
          transactionHashes: ['HASH1']
        }
      }));

    var getTransactionStub = sinon.stub(daemonHelper, 'getTransaction');
    getTransactionStub
      .withArgs('HASH1')
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var parseTransactionStub = sinon.stub(transactionBO, 'parseTransaction');
    parseTransactionStub
      .withArgs({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      })
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var getStatusStub = sinon.stub(daemonHelper, 'getStatus');
    getStatusStub
      .withArgs()
      .returns(Promise.resolve({
        error:{
          code: -32601,
          message: 'Method not found'
        },
        id: 'test',
        jsonrpc: '2.0'
      }));

    return bosWorker.run()
      .then(function(r) {
        expect(getUnconfirmedTransactionHashesStub.callCount).to.be.equal(1);
        expect(getTransactionStub.callCount).to.be.equal(1);
        expect(getStatusStub.callCount).to.be.equal(1);
        expect(parseTransactionStub.callCount).to.be.equal(1);
        expect(r).to.be.true;

        getUnconfirmedTransactionHashesStub.restore();
        getTransactionStub.restore();
        getStatusStub.restore();
        parseTransactionStub.restore();
      });
  });

  it('should not crach when the daemon (getTransactions) returns an error', function() {
    var getUnconfirmedTransactionHashesStub = sinon.stub(daemonHelper, 'getUnconfirmedTransactionHashes');
    getUnconfirmedTransactionHashesStub
      .withArgs()
      .returns(Promise.resolve({
        result: {
          transactionHashes: ['HASH1']
        }
      }));

    var getTransactionStub = sinon.stub(daemonHelper, 'getTransaction');
    getTransactionStub
      .withArgs('HASH1')
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var parseTransactionStub = sinon.stub(transactionBO, 'parseTransaction');
    parseTransactionStub
      .withArgs({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      })
      .returns(Promise.resolve({
        result: {
          transaction: {
            transactionHash: 'transactionHash'
          }
        }
      }));

    var getStatusStub = sinon.stub(daemonHelper, 'getStatus');
    getStatusStub
      .withArgs()
      .returns(Promise.resolve({
        id: 'test',
        jsonrpc: '2.0',
        result:{
          blockCount: 63667,
          knownBlockCount: 63667,
          lastBlockHash: 'bf95d3a66d2b23c5bca14aa5274ade97c024f8196285ad4654e5e699d195cde2',
          peerCount:76
        }
      }));

    var getTransactionsStub = sinon.stub(daemonHelper, 'getTransactions');
    getTransactionsStub
      .withArgs(0, 10000)
      .returns(Promise.resolve({
        error:{
          code: -32601,
          message: 'Method not found'
        },
        id: 'test',
        jsonrpc: '2.0'
      }));

    return bosWorker.run()
      .then(function(r) {
        expect(getUnconfirmedTransactionHashesStub.callCount).to.be.equal(1);
        expect(getStatusStub.callCount).to.be.equal(1);
        expect(getTransactionsStub.callCount).to.be.equal(1);
        expect(r).to.be.true;

        getUnconfirmedTransactionHashesStub.restore();
        getTransactionsStub.restore();
        getStatusStub.restore();
      });
  });

  it('should not crach when the daemon (getUnconfirmedTransactionHashes) returns an error', function() {
    var getUnconfirmedTransactionHashesStub = sinon.stub(daemonHelper, 'getUnconfirmedTransactionHashes');
    getUnconfirmedTransactionHashesStub
      .withArgs()
      .returns(Promise.resolve({
        error: {
        }
      }));

    return bosWorker.run()
      .then(function(r) {
        expect(getUnconfirmedTransactionHashesStub.callCount).to.be.equal(1);
        expect(r).to.be.true;

        getUnconfirmedTransactionHashesStub.restore();
      });
  });
});
