const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    companyName: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    paymentStatus: {
        type: String
    },
   
    followers: {
        type: String
    },
    age: {
        type: String
    },
    gender: {
        type: String
    },
    location: {
        type: String
    },
    image:{
        type:String
    },
   
  

    isActive:
    {
        type: Boolean
        
    },
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('Gigs', authenticationSchema);