var ModelParser       = require('../../../src/models/modelParser');
var chai              = require('chai');
var expect            = chai.expect;

describe('Models > ModelParser > ', function() {
  var modelParser = new ModelParser();

  it('clear', function() {
    var o = modelParser.clear({
      _id: 'ID'
    });

    expect(o.id).to.be.equal('ID');
  });

  it('prepare', function() {
    var o1 = modelParser.prepare({
      id: 'ID',
      _id: 'ID'
    }, true);
    var o2 = modelParser.prepare({
      id: 'ID2',
    });

    expect(o1.id).to.be.undefined;
    expect(o1._id).to.be.undefined;
    expect(o1.isEnabled).to.be.true;

    expect(o2.id).to.be.undefined;
    expect(o2._id).to.be.equal('ID2');
    expect(o2.isEnabled).to.be.undefined;
  });
});
