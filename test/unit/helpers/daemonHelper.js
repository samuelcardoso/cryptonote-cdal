var DaemonHelper      = require('../../../src/helpers/daemonHelper');
var RequestHelper     = require('../../../src/helpers/requestHelper');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('business > DaemonHelper', function() {
  var requestHelper = new RequestHelper();

  var daemonHelper = new DaemonHelper({
    requestHelper: requestHelper
  });
  daemonHelper.daemonEndpoint = 'http://localhost:8000/json_rpc';

  var commonRPCMessage = {
    params: undefined,
    method: 'method',
    id: 'ID',
    jsonrpc: '2.0'
  };

  var postJSONStub = sinon.stub(requestHelper, 'postJSON');

  it('should run the getBalance method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getBalance';
    message.params = {
      address: '<ADDRESS>'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getBalance('<ADDRESS>')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getAddresses method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getAddresses';

    console.log(JSON.stringify(message));
    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getAddresses()
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getSpendKeys method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getSpendKeys';
    message.params = {
      address: '<ADDRESS>'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getSpendKeys('<ADDRESS>')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getViewKey method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getViewKey';

    console.log(JSON.stringify(message));
    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getViewKey()
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the createAddress method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'createAddress';

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.createAddress()
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getTransactions method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getTransactions';
    message.params = {
      firstBlockIndex: 1481498,
      blockCount: 100,
      addresses: ['ADDRESS1', 'ADDRESS2'],
      paymentId: 'paymentId'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getTransactions(1481498, 100, ['ADDRESS1', 'ADDRESS2'], 'paymentId')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getTransaction method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getTransaction';
    message.params = {
      transactionHash: '<HASH>'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.getTransaction('<HASH>')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the getStatus method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'getStatus';

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.createAddress()
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the sendTransaction method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'sendTransaction';
    message.params = {
      anonymity: 6,
      fee: 1000000,
      unlockTime: 0,
      paymentId: 'paymentId',
      addresses: ['ADDRESS1', 'ADDRESS2'],
      transfers: {
        amount: 100,
        address: 'ADDRESS3'
      },
      changeAddress: 'ADDRESS4'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.sendTransaction(6, 1000000, 0, 'paymentId', ['ADDRESS1', 'ADDRESS2'], {
      amount: 100,
      address: 'ADDRESS3'
    },'ADDRESS4')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });

  it('should run the deleteAddress method', function() {
    var message = Object.assign({}, commonRPCMessage);
    message.method = 'deleteAddress';
    message.params = {
      address: '<ADDRESS>'
    };

    postJSONStub
      .withArgs('http://localhost:8000/json_rpc', [], message, [])
      .returns(Promise.resolve({
        var: 1
      }));

    return daemonHelper.deleteAddress('<ADDRESS>')
      .then(function(r) {
        expect(r.var).to.be.equal(1);
      });
  });
});
