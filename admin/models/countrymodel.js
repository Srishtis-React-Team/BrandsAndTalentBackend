const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

   
    name: {
        type: String,
        
    }, 
    countryId: {
        type: String, 
      
       
    },
    

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Country', authenticationSchema);