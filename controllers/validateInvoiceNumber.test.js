const validateInvoiceNumber = require('./validateInvoiceNumber');

test('validateInvoiceNumber will select the correct invoice number from array', async () => {
  const invoiceNumberCheck = [146499, 342010].find((refNumber) => {
    return validateInvoiceNumber(refNumber);
  });
  await expect(invoiceNumberCheck).toBe(146499);
});
