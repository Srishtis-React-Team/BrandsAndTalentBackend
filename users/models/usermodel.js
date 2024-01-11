const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
   fullName: {
        type: String
    },
    talent: {
        type: String
    },
    dob:{
      type:Date
    },
    gender:{
      type:String
    },
    height:{
      type:String
    },
    nationality:{
      type:String
    },
    phone: {
        type: Number
    },
    ethnicity:{                       
        
      type:String
   },
    email: {
        type: String
    },
    country:{
      type:String
    },
    city:{
      type:String
    },
   password: {
        type: String
    },
    image: {
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
     //
    
     hairColour:{
        type:String
     },
     hairType:{
        type:String
     },
     build:{
        type:String
     },
     skinType:{
        type:String
     },
     skinTone:{
        type:String
     },
     eyeColour:{
        type:String
     },
     hairLength:{           
        type:String
     },
     chest:{
        type:String
     },
     waist:{
        type:String
     },
     hipSize:{                
        type:String
     },
     dressSize:{ 
        type:String
     },
     shoeSize:{
        type:String
     },
     braSize:{
        type:String
     },
     transgender:{
        type:String
     },
     sexuality:{
        type:String
     },
     maritalStatus:{
        type:String
     },
     children:{
        type:String
     },
     pets:{
        type:String
     },
     diet:{
        type:String
     },
     //
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Users', authenticationSchema);