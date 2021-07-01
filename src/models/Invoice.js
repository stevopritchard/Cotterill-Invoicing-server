const mongoose = require('mongoose')
//consider adding validator module

const Invoice = mongoose.model('Invoice', {
    name: {
        type: String,
        required: true
    },
    validNumber: {
        type: Number,
        required: true
    },
    date: {
        type: String
    }
})

module.exports = Invoice