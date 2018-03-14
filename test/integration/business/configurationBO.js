var ConfigurationBO       = require('../../../src/business/configurationBO');
var DAOFactory            = require('../../../src/daos/daoFactory');
var ModelParser           = require('../../../src/models/modelParser');
var chai                  = require('chai');
var expect                = chai.expect;
                            require('../../../src/config/database.js')();

describe('api', function(){
  var bo = new ConfigurationBO({
    configurationDAO: DAOFactory.getDAO('configuration'),
    modelParser: new ModelParser()
  });

  before(function(){
    return bo.clear();
  });

  after(function(){
    return bo.clear();
  });

  describe('/v1/configurations', function(){
    it('should store a new key', function() {
      return bo.save({
        key: 'newKey',
        value: 'newValue'
      })
        .then(function(r) {
          expect(r).to.have.property('id');
          expect(r.value).to.be.equal('newValue');
          expect(r.createdAt).to.not.be.null;
          expect(r.updatedAt).to.be.undefined;
        });
    });

    it('should store update an existing key', function() {
      return bo.update({
        key: 'newKey',
        value: 'newValue'
      })
        .then(function(r) {
          expect(r).to.have.property('id');
          expect(r.value).to.be.equal('newValue');
          expect(r.createdAt).to.not.be.null;
          expect(r.updatedAt).to.not.be.null;
        });
    });

    it('should create a new key when the specified key does not exist', function() {
      return bo.saveOrUpdate({
        key: 'newKey-2',
        value: 'newValue'
      })
        .then(function(r) {
          expect(r).to.have.property('id');
          expect(r.value).to.be.equal('newValue');
          expect(r.createdAt).to.not.be.null;
          expect(r.updatedAt).to.be.undefined;
        });
    });

    it('should update a new key when the specified key exists', function() {
      return bo.saveOrUpdate({
        key: 'newKey-2',
        value: 'newValue'
      })
        .then(function(r) {
          expect(r).to.have.property('id');
          expect(r.value).to.be.equal('newValue');
          expect(r.createdAt).to.not.be.null;
          expect(r.updatedAt).to.not.be.null;
        });
    });

    it('should fail to create a configuration when the specified key exists', function() {
      return bo.save({
        key: 'newKey',
        value: 'newValue'
      })
        .catch(function(r) {
          expect(r.status).to.be.equal(409);
        });
    });

    it('should fail to update a configuration when the specified key does not exist', function() {
      return bo.update({
        key: 'invalidKey',
        value: 'newValue'
      })
        .catch(function(r) {
          expect(r.status).to.be.equal(404);
        });
    });

    it('should fail to delete a configuration when the specified key does not exist', function() {
      return bo.update({
        key: 'invalidKey',
        value: 'newValue'
      })
        .catch(function(r) {
          expect(r.status).to.be.equal(404);
        });
    });

    it('should delete a configuration key', function() {
      return bo.delete('newKey')
        .then(function() {
          return bo.getByKey('newKey');
        })
        .catch(function(r) {
          expect(r.status).to.be.equal(404);
        });
    });
  });
});
