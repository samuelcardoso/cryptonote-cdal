var mongoose = require('mongoose');
var mongooseSchema =  mongoose.Schema;

var model = null;

module.exports = function(){
  var schema = mongooseSchema({
    ownerId: {
      type: String,
      required: false,
    },
    ownerTransactionId: {
      type: String,
      required: false,
    },
    extra: {
      type: String,
      required: false
    },
    status: {
      type: Number,
      required: true
    },
    anonymity: {
      type: Number,
      required: true
    },
    fee: {
      type: Number,
      required: false
    },
    transactionHash: {
      type: String,
      required: false
    },
    paymentId: {
      type: String,
      required: false
    },
    addresses: [{
        type: String,
        required: true
      }
    ],
    transfers: [{
        amount: {
            type: Number,
            required: true
          },
        address: {
          type: String,
          required: false
        }
      }
    ],
    changeAddress: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      required: false,
    },
    updatedAt: {
      type: Date,
      required: false,
    }
  });

  model = model ? model : mongoose.model('transactionRequests', schema);

  return model;
};
