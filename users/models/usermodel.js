const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
   legalFirstName: {
      type: String
   },
   legalLastName: {
      type: String
   },
   talentEmail: {
      type: String
   },
   talentPassword: {
      type: String
   },
   mobileNo: {
      type: Number
   },
   country: {
      type: String
   },
   state: {
      type: String
   },
   address: {
      type: String
   },
   talentPassword: {

      type: String
   },
   legalChildFirstName: {
      type: String
   },
   legalChildLastName: {
      type: String
   },
   preferredFirstname: {
      type: String
   },
   preferredLastName: {
      type: String
   },
   aboutYou: {
      type: String
   },
   profession: {
      type: String
   },
   actorPerDay: {
      type: String
   },
   actorPerHr: {
      type: String
   },
   modelPerDay: {
      type: String
   },
   modelPerHr: {
      type: String
   },
   directorPerDay: {
      type: String
   },
   directorPerHr: {
      type: String
   },
   singerPerDay: {
      type: String
   },
   singerPerHr: {
      type: String
   },
   relevantCategories: {
      type: String
   },
   cv: {
      type: String
   },
   photo: {
      type: String
   },
   videosAndAudios: {
      type: String
   },
   hairColour: {
      type: String
   },
   eyeColour: {
      type: String
   },
   height: {
      type: String
   },
   shoeSize: {
      type: String
   },
   hips: {
      type: String
   },
   chest: {
      type: String
   },
   waist: {
      type: String
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
   dressSize: {
      type: String
   },
   socialMedia: {
      type: String
   },
   subscription: {
      type: String
   },
   userType: {
      type: String
   },
   preferredFirstname: {
      type: String
   },
   preferredLastName: {
      type: String
   },
   gender: {
      type: String
   },
   maritalStatus: {
      type: String
   },
   nationality: {
      type: String
   },
   ethnicity: {
      type: String
   },
   dob: {
      type: Date
   },
   languages: {
      type: String
   },
   contactPhone: {
      type: String
   },
   contactEmail: {
      type: String
   },
   country: {
      type: String
   },
   city: {
      type: String
   },
   aboutYou: {
      type: String
   },
   portfolio: {
      type: String

   },


   isActive:
   {
      type: Boolean,
      default: null
   },
   resetPasswordToken:
   {
      type: String,

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
module.exports = mongoose.model('Users', authenticationSchema);