const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

   
    name: {
        type: String, default: '',
    }, 
    content: {
        type: String,  
    },
    category:{
        type:String
    },
    link:{
        type:String
    },
    image:{
        type:String
    }
    

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Successstory', authenticationSchema);