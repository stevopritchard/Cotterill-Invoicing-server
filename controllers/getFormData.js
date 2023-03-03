const aws = require('aws-sdk');
const textractForm = require('./textractForm');
const validateInvoiceNumber = require('./validateInvoiceNumber');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const textract = new aws.Textract();

const getFormData = async (req) => {
  const textractResponse = await Promise.all(
    textractForm.textractFormResponse(req, textract)
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
