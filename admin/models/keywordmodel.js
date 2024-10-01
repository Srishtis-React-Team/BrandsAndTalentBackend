const mongoose = require("mongoose");

// Corrected the variable name to match your usage later in the userId field
const Schema = mongoose.Schema;

const authenticationSchema = new Schema({
    searchedKeyword: {
        type: String, 
    }, 
    isActive: {
        type: Boolean,
    },
    user_id:{
    type:  Schema.Types.ObjectId,
    ref: 'brands'
    },
  
},
{
    timestamps: true
});

module.exports = mongoose.model('Keywords', authenticationSchema);
