const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    position: {
        type: String
    },
    brandName: {
        type: String
    },
    brandEmail: {
        type: String
    },
    brandPassword: {
        type: String
    },
    confirmPassword: {
        type: String
    },


    isActive:
    {
        type: Boolean

    },
    isVerified:
    {
        type: Boolean

    },
    userType: {
        type: String,

    },
    otp: {
        type: String
    },
    brandPhone: {
        type: String
    },
    brandZipCode: {
        type: String
    },
    howHearAboutUs: {
        type: String
    },
    address: {
        type: String
    },
    logo: {
        type: Array
    },

    resetPasswordToken:
    {
        type: String,

    },
    googleId:
    
    {
        type: String,

    },
    facebookId:
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