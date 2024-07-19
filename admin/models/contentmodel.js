const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentItemSchema = new Schema({
    title: {
        type: String,
       
    },
    uniqueId: {
        type: String,
       
    },
    description: {
        type: Array,
        
    },
    image: {
        type: String,
       
    },
    
    userType:{
        type:String
    },
    
});

const contentSchema = new Schema({
    contentType: {
        type: String,
        
    },
    content:{
        type:String
    },
    items: [contentItemSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
