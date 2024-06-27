const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    name : {
        type: String
    },
    enquiry : {
        type: String
    },
    phoneNo : {
        type: String
    },
    email:  {
        type: String
    },
    answer : {
        type: String
    },
   
    
    isActive:
    {
        type: Boolean,
        default:true
        
    },
   
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    isRespond:{
        type:Boolean,
        default:false
    }

   
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('contact', authenticationSchema);