const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
   
   adultEmail: {
      type: String
   },
   talentPassword:{
      type: String

   },
   confirmPassword:{
    type: String

 },
   profession:{
      type: Array
   },
   relevantCategories:{
      type: Array
   },
   AdultFirstName:{
      type: String
   },
   AdultLastName: {
      type: String
   },
   preferredAdultFirstname: {
    type: String
    },
    preferredAdultLastName: {
    type: String
    },
  
   
   gender:{
      type:String
   },
   maritalStatus:{
    type:String
   },
   nationality:{
      type:String
   },
   ethnicity:{
      type:String
   },
   languages:{
      type:String
   },
   dob:{
      type:Date
   },
   contactPhone:{
      type:String
   },
   contactEmail:{
      type:String
   },
   country:{
      type:String
   },
   city:{
      type:String
   },
   aboutYou:{
      type:String
   },
   
   
   cv: {
      type: Array
   },
   photo: {
      type: Array
   },
   videosAndAudios: {
      type: Array
   },
   hairColour: {
      type: String
   },
   hairType:{
      type: String
   },
   build:{

      type: String
   },
   skinType:{
      type: String
   },
   skinTone:{
      type: String
   },
   eyeColour: {
      type: String
   },
   hairLength:{
      type: String
   },
   chest: {
    type: String
 },
 waist: {
    type: String
 },
 hipSize: {
    type: String
 },
 dressSize:{
    type: String
 },
 shoeSize: {
    type: String
 },
 braSize:{
    type: String
 },
 transgender:{
    type: String
 },
 sexuality:{
    type: String
 },
 height: {
      type: String
   },
 children:{
      type: String
   },
   pets:{
      type:String
   },
   diet:{
    type:String
   },
  weight: {
      type: String
   },
   neckToToe: {
      type: String
   },
   insideLeg: {
      type: String
   },
   subscriptionPlan: {
      type: String
   },
   userType: {
      type: String
   },
 
   
   portfolio: {
      type: String

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
module.exports = mongoose.model('Adult', authenticationSchema);