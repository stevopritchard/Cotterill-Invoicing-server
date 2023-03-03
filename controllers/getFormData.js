const textractForm = require('./textractForm');
const validateInvoiceNumber = require('./validateInvoiceNumber');

const getFormData = async (req) => {
  const textractResponse = await Promise.all(
    textractForm.textractFormResponse(req)
  );
  return Promise.all(
    Object.values(textractResponse).map((invoice) => {
      return {
        ...invoice,
        validRefNumber: invoice.candidateRefNumbers.find((refNumber) => {
          return validateInvoiceNumber(refNumber);
        }),
      };
    })
  );
};

module.exports = getFormData;
