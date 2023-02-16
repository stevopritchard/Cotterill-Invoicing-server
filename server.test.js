const mongoose = require('mongoose');
const app = require('./server');
const request = require('supertest');

afterAll(() => mongoose.disconnect());

test('first routing test...', async () => {
  const response = await request(app).get('/getAllInvoices');
  expect(response.statusCode).toBe(200);
});
