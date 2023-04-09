const mongoose = require('mongoose');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const validateInvoiceNumber = require('./validateInvoiceNumber');

afterAll(() => mongoose.disconnect());
jest.mock('../src/models/PurchaseOrder');

describe('validateInvoiceNumber', () => {
  it('acknowledges a ref # that matches a db record', async () => {
    PurchaseOrder.findOne.mockResolvedValue(true);

    const response = await validateInvoiceNumber();

    expect(response).toEqual(true);
  });

  it('will return "false" if the request does not match a record', async () => {
    PurchaseOrder.findOne.mockImplementation(() => {
      return Promise.resolve(false);
    });
    const invoiceNumberCheck = [123].find(async (refNumber) => {
      return await validateInvoiceNumber(refNumber);
    });
    console.log(invoiceNumberCheck);
    expect(await validateInvoiceNumber(123)).toEqual(false);
  });

  test('validateInvoiceNumber will select the correct invoice number from array', async () => {
    PurchaseOrder.findOne
      .mockImplementation(() => {
        return Promise.resolve(false);
      })
      .mockImplementation(() => {
        return Promise.resolve(false);
      })
      .mockImplementation(() => {
        return Promise.resolve(false);
      });
    const invoiceNumberCheck = [547328, 146499, 342010].find((refNumber) => {
      return validateInvoiceNumber(refNumber);
    });
    // const response = await validateInvoiceNumber(547328);
    await expect(invoiceNumberCheck).toBe(146499);
    // await expect(invoiceNumberCheck).toBe(true);
  });
});

describe('API request has invalid parameters in body', () => {
  test('A ref cannot be found', async () => {
    PurchaseOrder.findOne.mockImplementation(() => {
      return Promise.resolve(null);
    });
    const response = await validateInvoiceNumber();
    await expect(response).toBe(false);
  });
});

describe('API returns an arror if request body is invalid', () => {
  test('A ref cannot be found', async () => {
    PurchaseOrder.findOne.mockImplementation(() => {
      return Promise.resolve(new Error(400));
    });
    const response = await validateInvoiceNumber(123);
    await expect(response).toBe(400);
  });
});
