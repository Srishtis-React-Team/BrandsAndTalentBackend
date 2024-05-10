const mongoose = require("mongoose")
 var schema = mongoose.Schema;



 var Messageschema = new schema({

     chatId: {
         type: String
       
     },
     receiverId:{
        type: String
     },
     senderId: {  
         type:String 
      
     },
    text : {
        type: String,
     },
     userImage:{
        type:String
     },
     currentTime:{
        type:String
     },
     chatFile:{
        type:Object,
        default:null

     },


 },

     {
         timestamps: true
    });

module.exports = mongoose.model('message', Messageschema);

