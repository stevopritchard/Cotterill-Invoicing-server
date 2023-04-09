const PurchaseOrder = require('../src/models/PurchaseOrder');

const validateInvoiceNumber = async (refNumber) => {
  return await PurchaseOrder.findOne({ refNumber: refNumber })
    .then((foundPO) => {
      return foundPO ? true : false;
    })
    .catch((err) => {
      console.log(err);
      return `Cannot find purchase order with ref # ${refNumber}.`;
    });
};

module.exports = validateInvoiceNumber;
