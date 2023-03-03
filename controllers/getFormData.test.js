const getFormData = require('./getFormData');
const textractForm = require('./textractForm');

jest.mock('./textractForm');

test('should create response object', () => {
  const req = { files: [] };
  textractForm.textractFormResponse(req, textract);
});
