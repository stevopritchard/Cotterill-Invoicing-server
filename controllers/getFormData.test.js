const textractForm = require('./getFormData');
const request = require('supertest');
const express = require('express');

const app = express();

const payload = {
  files: [
    {
      fieldname: 'photo',
      originalname: 'Eccles 61275.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: '',
      filename: 'Eccles 61275.jpg',
      path: 'Eccles 61275.jpg',
      size: 197842,
    },
    {
      fieldname: 'photo',
      originalname: 'form-example.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: '',
      filename: 'form-example.png',
      path: 'form-example.png',
      size: 70402,
    },
  ],
};

const expectedResponseArray = [
  {
    name: 'Eccles 61275.jpg',
    candidateRefNumbers: ['146865'],
    validRefNumber: '146865',
    date: '16/02/2021',
    updated: true,
  },
  {
    name: 'form-example.png',
    candidateRefNumbers: [],
    date: '',
    updated: false,
  },
];

test('Reponse object array is created from Textract API response.', async () => {
  const response = await await request(app)
    .post('/getFormData')
    .send(payload)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(response).toBe(expectedResponseArray);
});
