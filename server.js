const express = require('express');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const config = require('../../Access Keys/AWS/config')
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config()

const postmanRequest = require('postman-request');
const bpAPIKey = process.env.BP_API_KEY;
const bpAppRef = process.env.BP_APP_REF;

require('./src/db/mongoose')
const Invoice = require('./src/models/Invoice')

const app = express();

const getFormData = require('./controllers/getFormData');
const getTableData = require('./controllers/getTableData');

var storage = multer.diskStorage({
    destination: __dirname + '/public/img',
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage: storage })

app.use(bodyParser.json());
var corsOptions = {
    origin: 'http://localhost:3000',
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.static('public'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
console.log(__dirname)


// aws.config.update({
//     accessKeyId: config.awsAccesskeyID,
//     secretAccessKey: config.secretAccessKey,
//     region: config.awsRegion
// })
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})
const textract = new aws.Textract()

app.post('/getFormData', upload.array('photo'), (req, res) => { 
    console.log(req.files)
    getFormData.textractForm(req, res, textract)
});

app.post('/getTableData', upload.single('photo'), (req, res) => { 
    getTableData.textractTable(req, res, textract) 
});

// app.post('/writeToFile', (req, res) => {
//     // console.log(typeof JSON.stringify(req.body))
//     fs.writeFileSync('public/img/test.json', JSON.stringify(req.body));
// })

app.post('/queryBp', (req, res) => {
    postmanRequest({
            uri: `https://ws-eu1.brightpearl.com/public-api/cotterillcivilslimited/order-service/order/${req.body.orderId}`,
            headers: {
                'brightpearl-app-ref': bpAppRef,
                'brightpearl-account-token': bpAPIKey
            }
        }, (error, response, body) => {
            const orderInfo = JSON.parse(body)
            if(!error && orderInfo.response[0]) {
                res.json(orderInfo.response[0])
            } else  {
                res.json(error)
            }
        })
});

app.post('/writeInvoice', (req, res) => {
    console.log(req.body)
    const invoice = new Invoice(req.body)

    invoice.save().then(() => {
        res.send(invoice)
    }).catch((err) => {
        throw new Error(err)
    })
})

app.post('/queryInvoice', (req, res) => {
    Invoice.find(req.body).then((returnedInvoice) => {
        if(returnedInvoice.length == 1) {
            if(returnedInvoice[0].validNumber === parseInt(req.body.validNumber)) {
                res.send(returnedInvoice)
            } else {
                throw new Error(`No matching PO found.`)
            }
        } else {
            throw new Error(`Does not appear to be a valid number`)
        }
    }).catch((error) => {
        console.log(req.body.validNumber+": "+error)
        res.json(error)
    })
})

