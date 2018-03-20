var DateHelper        = require('../../../src/helpers/dateHelper');
var chai              = require('chai');
var expect            = chai.expect;

describe('Helpers > DateHelper > ', function() {
  var dateHelper = new DateHelper();

  it('now', function() {
    var past = new Date(2000, 1, 1);
    var now = new Date();

    expect(dateHelper.getNow() > past).to.be.true;
    expect(dateHelper.getDate() <= dateHelper.getDate()).to.be.true;

    dateHelper.setNow(past);

    expect(dateHelper.getNow() < now).to.be.true;
    expect(dateHelper.getNow() === past).to.be.true;
  });
});
