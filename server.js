const express = require('express');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

require('./src/db/mongoose');
const Invoice = require('./src/models/Invoice');
const PurchaseOrder = require('./src/models/PurchaseOrder');

const app = express();

// handlers for the Textract response objects
const getFormData = require('./controllers/getFormData');
const getTableData = require('./controllers/getTableData');

var storage = multer.diskStorage({
  destination: __dirname + '/public/img',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

var whitelist = [
  'https://cotterill-invoicing-client.herokuapp.com/',
  'http://localhost:3000',
];

app.use(bodyParser.json());
var corsOptions = {
  origin: function (origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
};
app.use(cors());
app.use(express.static('public'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const textract = new aws.Textract();

app.post('/getFormData', upload.array('photo'), (req, res) => {
  // console.log(req.files);
  getFormData.textractForm(req, res, textract);
});

app.post('/getTableData', upload.single('photo'), (req, res) => {
  getTableData.textractTable(req, res, textract);
});

app.post('/writePurchaseOrder', (req, res) => {
  const purchaseOrder = new PurchaseOrder(req.body);

  purchaseOrder
    .save()
    .then(() => {
      res.send(purchaseOrder);
    })
    .catch((err) => {
      throw new Error(err);
    });
});

// creates a new JSON Invoice object
app.post('/writeInvoice', (req, res) => {
  const invoice = new Invoice(req.body);

  invoice
    .save()
    .then(() => {
      res.send(invoice);
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.post('/queryInvoice', (req, res) => {
  Invoice.find(req.body)
    .then((returnedInvoice) => {
      if (returnedInvoice.length == 1) {
        if (
          returnedInvoice[0].validRefNumber ===
          parseInt(req.body.validRefNumber)
        ) {
          res.send(returnedInvoice);
        } else {
          throw new Error(`No matching PO found.`);
        }
      } else {
        throw new Error(`Does not appear to be a valid number`);
      }
    })
    .catch((error) => {
      console.log(req.body.validRefNumber + ': ' + error);
      res.json(error);
    });
});

app.post('/deleteInvoice', (req, res) => {
  Invoice.find(req.body).then((toDelete) => {
    if (toDelete.length === 1) {
      if (toDelete[0].validRefNumber === req.body.validRefNumber) {
        Invoice.deleteOne(
          { validRefNumber: req.body.validRefNumber },
          function (err) {
            if (err) throw new Error('No matching PO found.');
            res.send('Sucessful deletion');
          }
        );
      }
    } else {
      throw new Error('Something went wrong.');
    }
  });
});

app.get('/getAllInvoices', (req, res) => {
  Invoice.find({})
    .then((invoiceList) => {
      res.send(invoiceList);
    })
    .catch((error) => {
      console.log(error);
    });
});
