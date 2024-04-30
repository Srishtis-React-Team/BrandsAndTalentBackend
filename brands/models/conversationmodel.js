// const mongoose = require("mongoose");

// const conversationSchema = new mongoose.Schema({
//   members: {
//     type: Array,
//     required: true,
//   },
//   lastMessage: {
//     type: String,
//     default: '',
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Conversation = mongoose.model("Conversation", conversationSchema);

// // Use module.exports for CommonJS
// module.exports = Conversation;



const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for a conversation
var ConversationSchema = new Schema(
  {
    // 'members' is an array of ObjectIDs referencing the 'users' collection
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


