
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for a conversation
var ConversationSchema = new Schema(
  {
  
    members: [
      {
        type: Array
       
      },
    ]
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('conversations', ConversationSchema);


