// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// // Define the schema for a chat with validation for members array
// const ChatSchema = new Schema(
//   {
//     members: {
//         type: [{ type: String }],
//         validate: {
//             validator: function (arr) {
//                 return arr.length === 2;
//             },
//             message: "Chat must have exactly 2 members."
//         },
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     }
//   },
//   {
//     timestamps: true // Automatically adds createdAt and updatedAt timestamps
//   }
// );

//module.exports = mongoose.model('Chat', ChatSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for a conversation
var ChatSchema = new Schema(
  {
    
    members: 
      {
        type: Array
       
      },
      isActive:{
        type:Boolean,
        default:true
      }
    
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('Chat', ChatSchema);


