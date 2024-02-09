const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    brandName: {
        type: String
    },
    brandEmail: {
        type: String
    },
    brandPassword: {
        type: String
    },
    brandPhone: {
        type: Number
    },
   
    brandZipCode: {
        type: Number
    },
    enableTracking: {
        type: String
    },
    howHearAboutUs: {
        type: String
    },
   
    jobTitle: {
        type: String
    },
    jobLocation: {
        type: String
    },
    jobAge: {
        type: Number
    },
    jobGender: {
        type: String
    },
    jobSocialFollowers: {
        type: Number
    },
    jobLanguages: {
        type: String
    },
    jobType: {
        type: String
    },
    jobRemote: {
        type: String
    },
    jobSummary: {
        type: String
    },
    jobYouWill: {
        type: String
    },
    jobIdeallyWill: {
        type: String
    },
    jobAboutUs: {
        type: String
    },
    jobBenefits: {
        type: Array
    },
    jobPayInformation: {
        type: String
    },
    jobCurrency: {
        type: String
    },
    jobFrequency: {
        type: String
    },
    jobAmountType: {
        type: String
    },
    jobMinPay: {
        type: String
    },
    jobMaxPay: {
        type: Number
    },
    jobImage: {
        type: String
    },


    isActive:
    {
        type: Boolean
        
    },
    resetPasswordToken:
    {
        type: String,

    },
    userType:{
        type: String,

    },

    resetPasswordExpires: Date,
    created: { type: Date, default: Date.now }, 

   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Brands', authenticationSchema);