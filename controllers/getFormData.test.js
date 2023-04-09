const getFormData = require('./getFormData');
const textractForm = require('./textractForm');
const validateInvoiceNumber = require('./validateInvoiceNumber');

jest.mock('./textractForm');
jest.mock('./validateInvoiceNumber');

const firstUpload = [
  {
    name: 'Invoice-1.png',
    candidateRefNumbers: ['146865'],
    validRefNumber: '',
    date: '08/08/08',
    updated: false,
  },
  {
    name: '61275.jpg',
    candidateRefNumbers: [],
    validRefNumber: '',
    date: '16/02/2021',
    updated: false,
  },
];

const secondUpload = [
  {
    name: 'late_order.png',
    candidateRefNumbers: ['019283'],
    validRefNumber: '',
    date: '',
    updated: false,
  },
  {
    name: 'Eccles 61275.jpg',
    candidateRefNumbers: ['214365'],
    validRefNumber: '',
    date: '16/02/2021',
    updated: false,
  },
  {
    name: 'Eccles 61275.jpg',
    candidateRefNumbers: ['90210'],
    validRefNumber: '',
    date: '16/02/2021',
    updated: false,
  },
];

describe('getFormData will...', () => {
  test('only assign valid ref #s to invoices with candidate refs', async () => {
    expect.assertions(2);
    validateInvoiceNumber.mockResolvedValue(true).mockResolvedValue(true);

    textractForm.textractFormResponse.mockImplementation(() =>
      firstUpload.map((obj) => Promise.resolve(obj))
    );

    const formData = await getFormData(firstUpload);

    expect(formData[0].validRefNumber).toEqual('146865');
    expect(formData[1].validRefNumber).toEqual(undefined);
  });

  test('only assign validate ref #s that are deemed valid by the callback validateInvoiceNumber', async () => {
    validateInvoiceNumber
      .mockResolvedValue(false)
      .mockResolvedValue(true)
      .mockResolvedValue(false);

    textractForm.textractFormResponse.mockImplementation(() =>
      secondUpload.map((obj) => Promise.resolve(obj))
    );

    const formData = await getFormData(firstUpload);

    expect(formData[1].validRefNumber).toEqual('214365');
  });
});

test('only assign validate ref #s that are deemed valid by the callback validateInvoiceNumber', async () => {
  // validateInvoiceNumber
  //   .mockResolvedValue(false)
  //   .mockResolvedValue(true)
  //   .mockResolvedValue(false);

  textractForm.textractFormResponse.mockImplementation(() =>
    [].map((obj) => Promise.resolve(obj))
  );

  const formData = await getFormData(firstUpload);
  console.log(formData);

  expect(formData[1].validRefNumber).toEqual('214365');
});
