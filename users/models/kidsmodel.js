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
      type:String
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
   // hairColour: {
   //    type: String
   // },
   // hairType:{
   //    type: String
   // },
   // build:{

   //    type: String
   // },
   // skinType:{
   //    type: String
   // },
   // skinTone:{
   //    type: String
   // },
   // eyeColour: {
   //    type: String
   // },
   // hairLength:{
   //    type: String
   // },
   // height: {
   //    type: String
   // },
   // shoeSize: {
   //    type: String
   // },
   // hipSize: {
   //    type: String
   // },
   // braSize:{
   //    type: String
   // },
   // transgender:{
   //    type: String
   // },
   // sexuality:{
   //    type: String
   // },
   // children:{
   //    type: String
   // },
   // pets:{
   //    type:String
   // },
   // dressSize:{
   //    type: String
   // },

   // chest: {
   //    type: String
   // },
   // waist: {
   //    type: String
   // },
   // weight: {
   //    type: String
   // },
   // neckToToe: {
   //    type: String
   // },
   // insideLeg: {
   //    type: String
   // },
 
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


},
   {
      timestamps: true


   });
module.exports = mongoose.model('Kids', authenticationSchema);