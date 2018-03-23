var mongoose = require('mongoose');
var mongooseSchema =  mongoose.Schema;

var model = null;

module.exports = function(){
  var schema = mongooseSchema({
    amount: {
      type: Number,
      required: true,
    },
    blockIndex: {
      type: Number,
      required: true
    },
    extra: {
      type: String,
      required: false
    },
    fee: {
      type: Number,
      required: true
    },
    isBase: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: false
    },
    state: {
      type: Number,
      required: false,
    },
    isConfirmed: {
      type: Boolean,
      required: false
    },
    timestamp: {
      type: Number,
      required: true
    },
    transactionHash: {
      type: String,
      required: true
    },
    transfers: [{
        amount: {
            type: Number,
            required: true
          },
        address: {
          type: String,
          required: false
        },
        type: {
          type: Number,
          required: false
        }
      }
    ],
    unlockTime: {
      type: Number,
      required: true
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

  model = model ? model : mongoose.model('blockchainTransactions', schema);

  return model;
};
