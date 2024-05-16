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
        type: Array
    },
    skills : {
        type: Array
    },
    additionalRequirements: {
        type: Array
    },
    age:{
        type:String
    },
    gender:{
        type:String
    },
    nationality:{
        type:String
    },
    languages:{
        type:Array
    },
    questions:{
        type:Array
    },
    benefits:{
        type:Array
    },
    compensation:{
        type: Object,
        default: null
    },
    jobType:{
        type:String
    },
    jobCurrency:{
        type:String
    },
    paymentType: {

        type: Object,
        default: null

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
        type:Array
    },
    product:{
        type:String
    },
    valueOfProduct:{
        type:String
    },
    productDescription:{
        type:String
    },
    hiringCompanyDescription:{
        type:Array
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
    type:{
        type:String,
        default:'Draft'
    },
   
    brandId:{
       
        type: schema.ObjectId,
      ref: 'Brands'
    },
    brandImage:{
      type:String
    },
    country:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    // jobPostedDate:{
    //     type:Date
    // },
    // lastDateForApply:{
    //     type:Date
    // },
   
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Draft', authenticationSchema);