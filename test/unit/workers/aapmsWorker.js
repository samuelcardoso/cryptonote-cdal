var DaemonHelper      = require('../../../src/helpers/daemonHelper');
var AddressBO         = require('../../../src/business/addressBO');
var ConfigurationBO   = require('../../../src/business/configurationBO');
var AAPMSWorker       = require('../../../src/workers/aapmsWorker');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('Workers > AAPMSWorker > ', function() {
  var daemonHelper = new DaemonHelper({});
  var addressBO = new AddressBO({});
  var configurationBO = new ConfigurationBO({});

  var aapmsWorker = new AAPMSWorker({
    daemonHelper: daemonHelper,
    addressBO: addressBO,
    configurationBO: configurationBO
  }, false);

  var getByKeyStub = sinon.stub(configurationBO, 'getByKey');
  getByKeyStub
    .withArgs('minimumAddressPoolSize')
    .returns(Promise.resolve({
      key: 'minimumAddressPoolSize',
      value: 10
    }));

  it('run', function() {
    var getFreeAddressesStub = sinon.stub(addressBO, 'getFreeAddresses');
    getFreeAddressesStub
      .withArgs()
      .returns(Promise.resolve([{}, {}, {}]));

    var createAddressFromDaemonStub = sinon.stub(addressBO, 'createAddressFromDaemon');
    createAddressFromDaemonStub
      .withArgs()
      .returns(Promise.resolve({}));

    return aapmsWorker.run()
      .then(function() {
        expect(getByKeyStub.callCount).to.be.equal(1);
        expect(getFreeAddressesStub.callCount).to.be.equal(1);
        expect(createAddressFromDaemonStub.callCount).to.be.equal(7);

        createAddressFromDaemonStub.restore();
        getFreeAddressesStub.restore();
      });
  });
});
