const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentItemSchema = new Schema({
    title: {
        type: String,
       
    },
    title2: {
        type: String,
       
    },
    title3: {
        type: String,
       
    },
    title4: {
        type: String,
       
    },
    title5: {
        type: String,
       
    },
    title6: {
        type: String,
       
    },
    title7: {
        type: String,
       
    },
    title8: {
        type: String,
       
    },
    icon:{
        type:String
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
