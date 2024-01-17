const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    companyName: {
        type: String
    },
    positionsNo: {
        type: String
    },
    contactNo: {
        type: Number
    },
    website: {
        type: String
    },
   
    image: {
        type: String
    },
    subscription: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },

    isActive:
    {
        type: Boolean,
        default: null
    },
    resetPasswordToken:
    {
        type: String,

    },

    resetPasswordExpires: Date,
    created: { type: Date, default: Date.now }, 

   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Brands', authenticationSchema);