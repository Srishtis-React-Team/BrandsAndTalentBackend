const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    name: {
        type: String
    },
    address: {
        type: String
    },
    contactNo: {
        type: Number
    },
    email: {
        type: String
    },
   
    password: {
        type: String
    },
    image: {
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
    userType:{
        type:String
    },

    resetPasswordExpires: Date,
    created: { type: Date, default: Date.now }, 

   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Admin', authenticationSchema);