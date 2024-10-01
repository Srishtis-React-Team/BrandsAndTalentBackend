const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    tempId: {
        type: String
    },
 
    isActive:
    {
        type: Boolean,
        default:true
        
    },
  
   
},
    {
        timestamps: true


    });
module.exports = mongoose.model('user', authenticationSchema);