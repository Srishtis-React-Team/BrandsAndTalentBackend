const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    name: {
        type: String
    },
    enquiry: {
        type: String
    },
    email: {
        type: Date
    },
    phoneNo: {
        type: String
    },
    
    isActive:
    {
        type: Boolean
        
    },
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('support', authenticationSchema);