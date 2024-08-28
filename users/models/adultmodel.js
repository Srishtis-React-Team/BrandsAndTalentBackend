const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({

   adultEmail: {
      type: String
   },
   talentPassword: {
      type: String

   },
   confirmPassword: {
      type: String

   },
   profession: {
      type: Array
   },
   relevantCategories: {
      type: Array
   },
   parentFirstName: {
      type: String
   },
   parentLastName: {
      type: String
   },
   preferredChildFirstname: {
      type: String
   },
   preferredChildLastName: {
      type: String
   },


   childGender: {
      type: String
   },
   maritalStatus: {
      type: String
   },
   childNationality: {
      type: Array
   },
   childEthnicity: {
      type: String
   },
   languages: {
      type: Array
   },
   childDob: {
      type: Date
   },
   childPhone: {
      type: String
   },
   contactEmail: {
      type: String
   },
   country: {
      type: String
   },
   childCity: {
      type: String
   },
   childAboutYou: {
      type: Array
   },
   childLocation: {
      type: String

   },


   cv: {
      type: Array
   },
   photo: {
      type: Array
   },
   // videosAndAudios: {
   //    type: Array
   // },
   features:{
      type: Array
   },
  
   subscriptionPlan: {
      type: String
   },
   userType: {
      type: String
   },


   portfolio: {
      type: Array

   },
  


   isActive:
   {
      type: Boolean,

   },
   resetPasswordToken:
   {
      type: String,

   },
   isVerified: {
      type: Boolean,

   },
   type: {
      type: String

   },
   instaFollowers: {
      type: String

   },
   tiktokFollowers: {
      type: String
   },
   twitterFollowers: {
      type: String
   },
   youtubeFollowers: {
      type: String

   },
   facebookFollowers: {
      type: String

   },
   linkedinFollowers: {
      type: String
   },
   threadsFollowers: {
      type: String
   },
   idType: {
      type: String

   },
   verificationId: {
      type: Array
   },
   services: {
      type: Array
   },

   reviews: {
      type: Array//String
   },


   resetPasswordExpires: Date,
   created: { type: Date, default: Date.now },
   otp: {
      type: String
   },
   bodyType: {
      type: String
   },
   industry: {
      type: String
   },
   isFavorite: {
      type: Boolean
   },
   bookJob: {
      type: String
   },
   rating: {
      type: String
   },
   image:{
      type:Object,
      default:null
   },
   profileStatus: {
      type: Boolean
   },
   ratingDescription:{
      type: String
   },
   age: {
      type:Number
   },
   isSubscribed:{
      type:Boolean,
      default:false
   },
   subscriptionId:{
      type: schema.ObjectId,
    ref: 'Subscription'
  },
   googleId: {
      type: String,
   },
   provider: {
      type: String,
   },
   facebookId: {
      type: String,
    },
    applications: [{
      gigId: mongoose.Schema.Types.ObjectId,
      isApplied: Boolean,
      brandId: mongoose.Schema.Types.ObjectId,
      appliedDate: { type: Date, default: Date.now },
      selectedLevel: {
         type: String,
         default:'new'
      },
  }],
    isApplied:{
      type: String,
      default:'false'
    },
    brandId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'brands'
    },
    gigId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gigs'
    },
    fcmToken :{
      type: String,
      default:''
   },
   isOnline: {
      type: Boolean,
      default: false
   },
   selectedLevel: {
      type: String,
      default:'new'
   },
   inActive:
   {
      type: Boolean,
      default:true
      
   },
   subscriptionType:{
      type:String
   },
   planName:{
      type:String,
      default:'Basic'
   },
   parentState:{
      type:String
   },
   parentAddress:{
      type:String
   },
   parentCountry:{
      type:String
   },
   adultLegalFirstName:{
      type:String
   },
   adultLegalLastName:{
      type:String
   },
   adminApproved:{
      type:Boolean,
      default:false
   },
   averageStarRatings:{
      type:String,
      default:'0'
   },
   totalReviews:{
      type:String
   },
   noOfJobsCompleted:{
      type:String
   },
videoList:[String],
audioList:[String],
  // videoAudioUrls: [String],
   publicUrl:{
      type:String
  },
  status:{
   type:String,
   default:'Pending'
  },
  profileApprove:{
   type:Boolean,
   default:false
  } ,

},
   {
      timestamps: true


   });
module.exports = mongoose.model('Adult', authenticationSchema);