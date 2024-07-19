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
    employmentType:  {
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
        type:Array
    },
    nationality:{
        type:Array
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
    lastDateForApply:{
        type:Date
    },
    category:{
        type:String
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    minAge:{
        type:String
    },
    maxAge:{
        type:String
    },
    instaMin:{
        type:String
    } ,
    instaMax:{
        type:String
    } ,
    tikTokMin:{
        type:String
    } ,
    tikTokMax:{
        type:String
    } ,
    linkedInMin:{
        type:String
    } ,
    linkedInMax:{
        type:String
    },
    fbMin:{
        type:String
    },
    fbMax:{
        type:String
    },
    twitterMin:{
        type:String
    },
    twitterMax:{
        type:String
    },
    youTubeMin:{
        type:String
    },
    youTubeMax:{
        type:String
    },
    adminApproved:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        default:'Pending'
    },
   

   
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Draft', authenticationSchema);