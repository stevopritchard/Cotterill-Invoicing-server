const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

require('./src/db/mongoose');
const Invoice = require('./src/models/Invoice');
const PurchaseOrder = require('./src/models/PurchaseOrder');

const app = express();

// handlers for the Textract response objects
const getFormData = require('./controllers/getFormData');
const textractTable = require('./controllers/textractTable');

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
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

app.post('/getFormData', upload.array('photo'), (req, res) => {
  getFormData(req)
    .then((validInvoices) => res.send(validInvoices))
    .catch((err) => console.log('Error:', err));
});

app.post('/getTableData', upload.single('photo'), (req, res) => {
  textractTable.textractTable(req, res, textract);
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

app.post('/queryPurchaseOrder', (req, res) => {
  const { refNumber } = req.body;

  PurchaseOrder.findOne({ refNumber: refNumber })
    .then((foundPO) => {
      foundPO ? res.send(foundPO) : res.send(false);
    })
    .catch((err) =>
      res.json(`Cannot find purchase order with ref # ${refNumber}.`)
    );
});

app.post('/queryInvoice', async (req, res) => {
  const { validRefNumber } = req.body;

  Invoice.findOne({
    validRefNumber: validRefNumber,
  })
    .then((returnedInvoice) => {
      returnedInvoice ? res.send(returnedInvoice) : res.send(false);
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.post('/fulfillPurchaseOrder', async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findOne({
    refNumber: req.body.refNumber,
  });

  purchaseOrder.set({ isFulfilled: true });

  await purchaseOrder
    .save()
    .then((fulfilledPO) => {
      res.send(fulfilledPO);
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.post('/unFulfillPurchaseOrder', async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findOne({
    refNumber: req.body.refNumber,
  });

  purchaseOrder.set({ isFulfilled: false });

  await purchaseOrder
    .save()
    .then((fulfilledPO) => {
      res.send(fulfilledPO);
    })
    .catch((err) => {
      throw new Error(err);
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
      res.json(error);
    });
});

module.exports = app;
