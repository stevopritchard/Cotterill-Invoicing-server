const PurchaseOrder = require('../src/models/PurchaseOrder');

const validateInvoiceNumber = async (refNumber) => {
  // const foundPO = PurchaseOrder.findOne({ refNumber: refNumber });
  await PurchaseOrder.findOne({ refNumber: refNumber })
    .then((foundPO) => {
      console.log(foundPO ? true : false);
      return foundPO ? true : false;
    })
    .catch((err) => {
      console.log(err);
      return `Cannot find purchase order with ref # ${refNumber}.`;
    });
  // return foundPO ? true : false;
};

module.exports = validateInvoiceNumber;
