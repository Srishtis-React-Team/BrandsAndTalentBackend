const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
   parentFirstName: {
      type: String
   },
   parentLastName: {
      type: String
   },
   parentEmail: {
      type: String
   },
   parentMobileNo:{
      type: String

   },
   parentCountry:{
      type: String
   },
   parentState:{
      type: String
   },
   parentAddress:{
      type: String
   },
   talentPassword: {
      type: String
   },
   confirmPassword:{
      type:String
   },
   profession: {
      type: Array
   },
  
   relevantCategories: {
      type: Array
   },
   childFirstName:{
      type:String
   },
   childLastName:{
      type:String
   },
  
   preferredChildFirstname: {
      type: String
   },
   preferredChildLastName: {
      type: String
   },
   childGender:{
      type:String
   },
   childNationality:{
      type:String
   },
   childEthnicity:{
      type:String
   },
   languages:{
      type:String
   },
   childDob:{
      type:String
   },
   childPhone:{
      type:String
   },
   childEmail:{
      type:String
   },
   childLocation:{
      type:String
   },
   childCity:{
      type:String
   },
   childAboutYou:{
      type:Array
   },
   
   
   cv: {
      type: Array
   },
   
   videosAndAudios: {
      type: Array
   },
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
   isVerified:{
      type: Boolean,

   },
   type:{
      type:String

   },
   instaFollowers:{
      type:String

   },
   tiktokFollowers:{
      type:String
   },
   twitterFollowers:{
      type:String
   },
   youtubeFollowers:{
      type:String

   },
   facebookFollowers:{
      type:String

   },
   linkedinFollowers:{
      type:String
   },
   threadsFollowers:{
      type:String
   },
   idType:{
      type:String

   },
   verificationId:{
      type:Array
   },

   // token:{
   //     type:String
   // },
   resetPasswordExpires: Date,
   created: { type: Date, default: Date.now },
   
   otp:{
      type:String
   },
   bodyType:{
      type:String
   },
   industry:{
      type:String
   },
   isFavorite:{
      type:Boolean
   },
   bookJob:{
      type:String
   },
   rating:{
      type:String
   },
   image:{
      type:Object,
      default:null
   },
   services:{
      type:Array
   },
   reviews:{
      type:String
   },
   maritalStatus: {
      type:String
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
  profileStatus: {
   type: Boolean
},
googleId:{
   type: String,
},

facebookId: {
   type: String,
 },
 name: {
   type: String,
   trim: true,
 },
 photoURL: {
   type: String,
 },
 provider: {
   type: String,
 },
 isApplied:{
   type: String,
   default:'false'
 },
 brandId:{
   type: schema.ObjectId,
   ref: 'brands'
 },
 gigId:{
   type: schema.ObjectId,
   ref: 'gigs'
 },
 fcmToken :{
   type: String,
},


},
   {
      timestamps: true


   });
module.exports = mongoose.model('Kids', authenticationSchema);