const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

    transactionid: {
        type: Number, 
        default: '',
    }, 
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Paymenttransaction', authenticationSchema);