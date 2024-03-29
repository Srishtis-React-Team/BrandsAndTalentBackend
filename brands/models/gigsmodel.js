const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    jobTitle : {
        type: String
    },
    jobLocation : {
        type: String
    },
    streetAddress : {
        type: String
    },
    workplaceType:  {
        type: String
    },
   
    jobType : {
        type: String
    },
    jobDescription : {
        type: String
    },
    skills : {
        type: Array
    },
    additionalRequirements: {
        type: String
    },
    age:{
        type:Number
    },
    gender:{
        type:String
    },
    nationality:{
        type:String
    },
    languages:{
        type:String
    },
    questions:{
        type:Array
    },
    benefits:{
        type:Array
    },
    compensation:{
        type:String
    },
    jobType:{
        type:String
    },
    jobCurrency:{
        type:String
    },
    paymentType:{
        type:String
    },
    minPay:{
        type:String
    },
    maxPay:{
        type:String
    },
    hiringCompany:{
        type:String
    },
    whyWorkWithUs:{
        type:String
    },
    hiringCompanyDescription:{
        type:String
    },

    howLikeToApply:{
        type:String
    },
    workSamples:{
        type:Array
    },
    jobImage:{
        type:Array
    },
    isActive:
    {
        type: Boolean,
        default:true
        
    },
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Gigs', authenticationSchema);