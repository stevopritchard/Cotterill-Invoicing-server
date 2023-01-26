const mongoose = require('mongoose');

const PurchaseOrder = mongoose.model('PurchaseOrder', {
  name: {
    type: String,
    required: true,
  },
  refNumber: {
    type: Number,
    required: true,
  },
  isFulfilled: {
    type: Boolean,
    required: true,
  },
  date: {
    type: String,
  },
});

const dummyPO = new PurchaseOrder({
  name: 'test',
  refNumber: 123456,
  isFulfilled: false,
});
// dummyPO.save();

module.exports = PurchaseOrder;
