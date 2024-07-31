const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogItemSchema = new Schema({
    image:{
        type:String
    },
    title:{
        type:String
    },
    heading:{
        type:String
    },
    description:{
        type:String
    },
    type:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    },
    mainTitle:{
        type:String
    },
    blogBy:{
        type:String
    },
    url:{
        type:String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogItemSchema);
