
const mongoose = require("mongoose")
var schema = mongoose.Schema;

const couponSchema = new mongoose.Schema({
   code: String,
   currency: String,
   discountAmount: Number,
   isActive: Boolean,
   expiry: Date,
   type: String,
   couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
});
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
   preferredChildFullName:{
      type:String
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
      type: String
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
   features: {
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
   image: {
      type: Object,
      default: null
   },
   profileStatus: {
      type: Boolean
   },
   ratingDescription: {
      type: String
   },
   age: {
      type: Number
   },
   isSubscribed: {
      type: Boolean,
      default: false
   },
   subscriptionId: {
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
         default: 'new'
      },
   }],
   isApplied: {
      type: String,
      default: 'false'
   },
   brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'brands'
   },
   gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gigs'
   },
   fcmToken: {
      type: String,
      default: ''
   },
   isOnline: {
      type: Boolean,
      default: false
   },
   selectedLevel: {
      type: String,
      default: 'new'
   },
   inActive:
   {
      type: Boolean,
      default: true

   },
   subscriptionType: {
      type: String
   },
   planName: {
      type: String,
      default: 'Basic'
   },
   parentState: {
      type: String
   },
   parentAddress: {
      type: String
   },
   parentCountry: {
      type: String
   },
   adultLegalFirstName: {
      type: String
   },
   adultLegalLastName: {
      type: String
   },
   adminApproved: {
      type: Boolean,
      default: false
   },
   averageStarRatings: {
      type: String,
      default: '0'
   },
   totalReviews: {
      type: String
   },
   noOfJobsCompleted: {
      type: String
   },
   videoList: [String],
   audioList: [String],
   // videoAudioUrls: [String],
   publicUrl: {
      type: String
   },
   status: {
      type: String,
      default: 'Pending'
   },
   profileApprove: {
      type: Boolean,
      default: true
   },
   instagramUrl: {
      type: String
   },
   tikTokUrl: {
      type: String
   },
   youTubeUrl: {
      type: String
   },
   linkedinUrl: {
      type: String
   },
   facebookUrl: {
      type: String
   },
   threadsUrl: {
      type: String
   },
   twitterUrl: {
      type: String
   },
   coupon: [couponSchema], // Array of coupon objects
   paid: {
      type: Boolean,
      default: false
   },
   transactionDate: {
      type: Date
   },
   paymentStatus: {
      type: String
   },
   paymentCurreny: {
      type: String
   },
   paymentAmount: {
      type: Number
   },
   paymentPeriod: {
      type: String
   },
   paymentPlan: {
      type: String
   },
   accountBlock:{
      type:Boolean
   },
   transId:{
      type:String
   },
   adultName:{
      type:String
   },
   gift:[{
      receiversFirstName: String,
      receiverEmail: String,
      announceDate: Date,
      message:String,
      subscriptionPlan:String,
      planName:String,
      expiry:Date,
      transId:String,
      transactionDate:Date, 
      paymentStatus:String, 
      paymentCurreny:String, 
      paymentAmount:Number, 
      paymentPeriod:String, 
      paymentPlan:String,
      coupon:String,
      code:String
     
  }],


},
   {
      timestamps: true


   });

module.exports = mongoose.model('Adult', authenticationSchema);

