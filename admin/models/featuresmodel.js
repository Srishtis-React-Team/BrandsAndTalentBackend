const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

   
    features: {
        type: Array, default: '',
        
    }, 
    isActive: {
        type: Boolean, 
      
       
    },
    

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Features', authenticationSchema);