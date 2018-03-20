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
    confirmations: {
      type: Number,
      required: true
    },
    blockIndex: {
      type: Number,
      required: true
    },
    extra: {
      type: String,
      required: false
    },
    isConfirmed: {
      type: Boolean,
      required: true
    },
    isNotified: {
      type: Boolean,
      required: true
    },
    anonymity: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    fee: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Number,
      required: true
    },
    transactionHash: {
      type: String,
      required: true
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
    },
    createdByBOS: {
      type: Boolean,
      required: false,
    }
  });

  model = model ? model : mongoose.model('transactions', schema);

  return model;
};
