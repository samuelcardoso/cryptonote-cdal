var ConfigurationBO   = require('../../../src/business/configurationBO');
var ModelParser       = require('../../../src/models/modelParser');
var DateHelper        = require('../../../src/helpers/dateHelper');
var DAOFactory        = require('../../../src/daos/daoFactory');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('Business > ConfigurationBO > ', function() {
  var configurationDAO = DAOFactory.getDAO('configuration');
  var dateHelper = new DateHelper();
  var modelParser = new ModelParser();
  var configurationBO = new ConfigurationBO({
    configurationDAO: configurationDAO,
    modelParser: modelParser,
    dateHelper: dateHelper
  });

  describe('Methods > ', function() {
    it('clear', function() {
      var clearStub = sinon.stub(configurationDAO, 'clear');
      clearStub
        .withArgs()
        .returns(Promise.resolve());

      return configurationBO.clear()
        .then(function(){
          expect(clearStub.callCount).to.be.equal(1);
          clearStub.restore();
        });
    });

    it('getAll', function() {
      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({isEnabled: true})
        .returns(Promise.resolve([]));

      return configurationBO.getAll()
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);

          getAllStub.restore();
        });
    });

    it('save', function() {
      var now = new Date();

      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'new-key', isEnabled: true})
        .returns(Promise.resolve([]));

      var saveSub = sinon.stub(configurationDAO, 'save');
      saveSub
        .withArgs({
          key: 'new-key',
          value: 'new-value',
          isEnabled: true,
          createdAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          key: 'new-key',
          value: 'new-value',
          createdAt: now
        }));

      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var prepareStub = sinon.stub(modelParser, 'prepare');
      prepareStub
        .withArgs({
          key: 'new-key',
          value: 'new-value'
        }, true)
        .returns({
          key: 'new-key',
          value: 'new-value',
          isEnabled: true
        });

      return configurationBO.save({
        key: 'new-key',
        value: 'new-value'
      })
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.key).to.be.equal('new-key');
          expect(r.value).to.be.equal('new-value');

          expect(getAllStub.callCount).to.be.equal(1);
          expect(getNowStub.callCount).to.be.equal(1);
          expect(saveSub.callCount).to.be.equal(1);
          expect(prepareStub.callCount).to.be.equal(1);

          getAllStub.restore();
          getNowStub.restore();
          saveSub.restore();
          prepareStub.restore();
        });
    });

    it('save should fail if a existing key was supplied', function() {
      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'key', isEnabled: true})
        .returns(Promise.resolve([{
          _id: 'ID',
          key: 'key',
          value: 'value'
        }]));

      return configurationBO.save({
        key: 'key',
        value: 'new-value'
      })
        .catch(function(r){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(r.status).to.be.equal(409);
          expect(r.message).to.be.equal('The key key is already in use by other configuration');

          getAllStub.restore();
        });
    });

    it('initialize', function() {
      var now = new Date();

      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'new-key', isEnabled: true})
        .returns(Promise.resolve([]));

      var saveSub = sinon.stub(configurationDAO, 'save');
      saveSub
        .withArgs({
          key: 'new-key',
          value: 'new-value',
          isEnabled: true,
          createdAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          key: 'new-key',
          value: 'new-value',
          createdAt: now
        }));

      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var prepareStub = sinon.stub(modelParser, 'prepare');
      prepareStub
        .withArgs({
          key: 'new-key',
          value: 'new-value'
        }, true)
        .returns({
          key: 'new-key',
          value: 'new-value',
          isEnabled: true
        });

      return configurationBO.initialize({
        key: 'new-key',
        value: 'new-value'
      })
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.key).to.be.equal('new-key');
          expect(r.value).to.be.equal('new-value');
          expect(r.createdAt).to.be.equal(now);
          expect(r.updatedAt).to.be.undefined;

          expect(getAllStub.callCount).to.be.equal(2);
          expect(getNowStub.callCount).to.be.equal(1);
          expect(saveSub.callCount).to.be.equal(1);
          expect(prepareStub.callCount).to.be.equal(1);

          getAllStub.restore();
          getNowStub.restore();
          saveSub.restore();
          prepareStub.restore();
        });
    });

    it('initialize should return a database configuration if it exists there', function() {
      var now = new Date();

      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'key', isEnabled: true})
        .returns(Promise.resolve([{
          _id: 'ID',
          key: 'key',
          value: 'value',
          createdAt: now,
          updatedAt: now
        }]));

      return configurationBO.initialize({
        key: 'key',
        value: 'value'
      })
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.key).to.be.equal('key');
          expect(r.value).to.be.equal('value');
          expect(r.createdAt).to.be.equal(now);
          expect(r.updatedAt).to.be.equal(now);

          expect(getAllStub.callCount).to.be.equal(1);
          getAllStub.restore();
        });
    });

    it('update', function() {
      var now = new Date();

      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'new-key', isEnabled: true})
        .returns(Promise.resolve([{
          key: 'new-key',
          value: 'new-value',
          id: 'ID',
          createdAt: now
        }]));

      var updateStub = sinon.stub(configurationDAO, 'update');
      updateStub
        .withArgs({
          _id: 'ID',
          key: 'new-key',
          value: 'new-value',
          createdAt: now,
          updatedAt: now
        })
        .returns(Promise.resolve({
          _id: 'ID',
          key: 'new-key',
          value: 'new-value',
          createdAt: now,
          updatedAt: now
        }));

      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var prepareStub = sinon.stub(modelParser, 'prepare');
      prepareStub
        .withArgs({
          key: 'new-key',
          value: 'new-value',
          id: 'ID',
          createdAt: now
        })
        .returns({
          _id: 'ID',
          key: 'new-key',
          value: 'new-value',
          createdAt: now
        });

      return configurationBO.update({
        key: 'new-key',
        value: 'new-value'
      })
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.key).to.be.equal('new-key');
          expect(r.value).to.be.equal('new-value');
          expect(r.createdAt).to.be.equal(now);
          expect(r.updatedAt).to.be.equal(now);
          expect(getAllStub.callCount).to.be.equal(1);
          expect(getNowStub.callCount).to.be.equal(1);
          expect(updateStub.callCount).to.be.equal(1);
          expect(prepareStub.callCount).to.be.equal(1);

          getAllStub.restore();
          getNowStub.restore();
          updateStub.restore();
          prepareStub.restore();
        });
    });

    it('update should fail with an invalid key', function() {
      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'key', isEnabled: true})
        .returns(Promise.resolve([]));

      return configurationBO.update({
        key: 'key',
        value: 'new-value'
      })
        .catch(function(r){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(r.status).to.be.equal(404);
          expect(r.message).to.be.equal('The configuration key was not found');

          getAllStub.restore();
        });
    });

    it('disable', function() {
      var now = new Date();

      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'key', isEnabled: true})
        .returns(Promise.resolve([{
          key: 'key',
          value: 'value',
          id: 'ID',
          createdAt: now
        }]));

      var disableStub = sinon.stub(configurationDAO, 'disable');
      disableStub
        .withArgs('key')
        .returns(Promise.resolve({
          _id: 'ID',
          key: 'key',
          value: 'value'
        }));

      return configurationBO.delete('key')
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(disableStub.callCount).to.be.equal(1);

          getAllStub.restore();
          disableStub.restore();
        });
    });

    it('disable method should fail with an invalid key', function() {
      var getAllStub = sinon.stub(configurationDAO, 'getAll');
      getAllStub
        .withArgs({key: 'key', isEnabled: true})
        .returns(Promise.resolve([]));

      return configurationBO.delete('key')
        .catch(function(r){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(r.status).to.be.equal(404);
          expect(r.message).to.be.equal('The configuration key was not found');

          getAllStub.restore();
        });
    });
  });
});
