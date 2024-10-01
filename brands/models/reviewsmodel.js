const mongoose = require("mongoose")
var schema = mongoose.Schema;


var authenticationSchema = new schema({
    reviewerDescription: {
        type: String
    },
    reviewerTitle: {
        type: String
    },
    reviewerDate: {
        type: Date
    },
    initialLetter: {
        type: String
    },
    rating: {
        type: String
    },
    reviewerName: {
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
module.exports = mongoose.model('Reviews', authenticationSchema);