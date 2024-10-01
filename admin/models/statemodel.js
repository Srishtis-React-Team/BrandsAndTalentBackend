const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

   
    countryName: {
        type: String,
        
    }, 
    countryId: {
        type: String, 
      
       
    },
    stateId:{
        type: String, 
    },
    name:{
        type:String
    },

    

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('State', authenticationSchema);