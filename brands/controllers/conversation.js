const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
//const io = require("../../socket").io;
// const io = require('../../server'); // Import your socket.io instance
// const userss = [];


 
// Import necessary Firestore query functions
// const { query, where, getDocs, addDoc } = require('firebase/firestore');
// const { conversations } = require('../../index'); // Correct path according to your project structure

const conversationmodel = require("../models/conversationmodel");
const messagemodel = require("../models/messagemodel");
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");

/**
 *********Add Conversation******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
  const addConversation = async (req, res) => {
 const newConversation = new conversationmodel({
  members: [req.body.senderId, req.body.receiverId],
});

try {
  const savedConversation = await newConversation.save();
  res.status(200).json(savedConversation);
} catch (err) {
  res.status(500).json(err);

}
}
//today commented code
//  const addConversation = async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;

//     // Check if sender and receiver are the same
//     if (senderId === receiverId) {
//       return res.status(400).json({ message: "Sender and receiver cannot be the same." });
//     }

//     // Ensure both sender and receiver are provided
//     if (!senderId || !receiverId) {
//       return res.status(400).json({ message: "Both senderId and conversationId are required." });
//     }

//     // Check if a conversation already exists between the participants
//     const existingConversation = await conversationmodel.findOne({
//       members: { $all: [senderId, receiverId] },
//     });

//     if (existingConversation) {
//       return res.status(200).json({
//         message: "Conversation already exists.",
//         conversation: existingConversation,
//       });
//     }

//     // Create a new conversation if it does not exist
//     const newConversation = new conversationmodel({
//       members: [senderId, receiverId],
//     });

//     const savedConversation = await newConversation.save();

//     // Emit a Socket.IO event to notify about the new conversation
//     io.emit("new-conversation", {
//       message: "New conversation created",
//       conversation: savedConversation,
//     });

//     // Return the created conversation as the response
//     res.status(201).json({
//       message: "Conversation created successfully.",
//       conversation: savedConversation,
//     });
//   } catch (error) {
//     console.error("Error in addConversation:", error);
//     res.status(500).json({ message: "An unexpected error occurred.", error: error.message });
//   }
// };

// const addConversation = async (req, res) => {
//   try {
//     const { senderId, conversationId } = req.body;

//     if (senderId === conversationId) {
//       return res.status(400).json({ message: "Sender and receiver cannot be the same." });
//     }

//     if (!senderId || !conversationId) {
//       return res.status(400).json({ message: "Both senderId and conversationId are required." });
//     }

//     const existingConversation = await conversationmodel.findOne({
//       members: { $all: [senderId, conversationId] },
//     });

//     if (existingConversation) {
//       return res.status(200).json({
//         message: "Conversation already exists.",
//         conversation: existingConversation,
//       });
//     }

//     const newConversation = new conversationmodel({
//       members: [senderId, conversationId],
//     });

//     const savedConversation = await newConversation.save();

//     // Emit the event to notify clients about the new conversation
//     io.emit("new-conversation", {
//       message: "New conversation created",
//       conversation: savedConversation,
//     });

//     res.status(201).json({
//       message: "Conversation created successfully.",
//       conversation: savedConversation,
//     });
//   } catch (error) {
//     console.error("Error in addConversation:", error);
//     res.status(500).json({ message: "An unexpected error occurred.", error: error.message });
//   }
// };

// const addConversation = async (req, res) => {
//   try {
//     const { senderId, conversationId } = req.body;

//     if (senderId === conversationId) {
//       return res.status(400).json({
//         status: false,
//         message: "Sender and receiver cannot be the same."
//       });
//     }

//     if (!senderId || !conversationId) {
//       return res.status(400).json({
//         status: false,
//         message: "Both senderId and conversationId are required."
//       });
//     }

//     // Check if a conversation already exists
//     const conversationQuery = query(
//       conversations,
//       where("members", "array-contains-any", [senderId, conversationId])
//     );

//     const querySnapshot = await getDocs(conversationQuery);
//     const existingConversations = querySnapshot.docs.filter(doc => 
//       doc.data().members.includes(senderId) && doc.data().members.includes(conversationId)
//     );

//     if (existingConversations.length > 0) {
//       return res.status(200).json({
//         status: true,
//         message: "Conversation already exists.",
//         conversation: existingConversations[0].data() // Return the first existing conversation
//       });
//     }

//     // Create a new conversation
//     const newConversation = await addDoc(conversations, {
//       members: [senderId, conversationId]
//     });

//     res.status(201).json({
//       status: true,
//       message: "Conversation created successfully.",
//       conversation: { id: newConversation.id, members: [senderId, conversationId] }
//     });
//   } catch (error) {
//     console.error("Error in addConversation:", error);
//     res.status(500).json({
//       status: false,
//       message: "An unexpected error occurred.",
//       error: error.message
//     });
//   }
// };

//correct

//  const addConversation = async (req, res, next) => {
//   try {
//     const { senderId, conversationId } = req.body;

//     // Validate senderId and conversationId are not the same
//     if (senderId === conversationId) {
//       return res.status(400).json({
//         status: false,
//         message: "Sender and receiver cannot be the same.",
//       });
//     }

//     // Validate that both senderId and conversationId are provided
//     if (!senderId || !conversationId) {
//       return res.status(400).json({
//         status: false,
//         message: "Both senderId and conversationId are required.",
//       });
//     }

//     // Check if a conversation already exists between these two members
//     const existingConversation = await conversation.findOne({
//       members: { $all: [senderId, conversationId] },
//     });

//     if (existingConversation) {
//       return res.status(200).json({
//         status: true,
//         message: "Conversation already exists.",
//         conversation: existingConversation,
//       });
//     }

//     // If no existing conversation, create a new one
//     const newConversation = new conversation({
//       members: [senderId, conversationId],
//     });

//     const savedConversation = await newConversation.save();

//     // Return the saved conversation details
//     res.status(201).json({
//       status: true,
//       message: "Conversation created successfully.",
//       conversation: savedConversation,
//     });
//   } catch (error) {
//     console.error("Error in addConversation:", error);
//     res.status(500).json({
//       status: false,
//       message: "An unexpected error occurred.",
//       error: error.message,
//     });
//   }
// };

//correct

//  const addConversation = async (req, res, next) => {
//   try {
//       const { senderId, conversationId } = req.body;

//       // Assuming 'members' is expected to be an array of member IDs:
//       const newConversation = new conversationmodel({ members: [senderId, conversationId] });
//       const savedConversation = await newConversation.save();

//       // Now returning the saved conversation details in the response
//       res.status(201).json({
//           status: true,
//           message: 'Saved Successfully',
//           conversation: savedConversation
//       });
//   } catch (error) {
//       // Improved error handling: return a 500 status code for server errors
//       res.status(500).json({
//           status: false,
//           message: error.message || "An unexpected error occurred"
//       });
//   }
// };


/**
 *********List by brand id******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const listBrandChat = async (req, res, next) => {


  const brandId = req.body.brandId;

  conversationmodel.find({ brandId: mongoose.Types.ObjectId(brandId) }).sort({ created: -1 })
    .then((response) => {
      res.json({
        status: true,
        data: response,
      });
    })
    .catch((error) => {
      res.json({
        status: false,
      });
    });
};
/**
 *********List by talent id******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const listTalentChat = async (req, res, next) => {


  const talentId = req.body.talentId;

  conversationmodel.find({ talentId: mongoose.Types.ObjectId(talentId) }).sort({ created: -1 })
    .then((response) => {
      res.json({
        status: true,
        data: response,
      });
    })
    .catch((error) => {
      res.json({
        status: false,
      });
    });
};
/**
 *********single chat Admin,either user or negotiator******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const listBrandsAndTalent = async (req, res, next) => {

  const brandId = req.body.brandId;
  const talentId = req.body.talentId

  conversationmodel.find({ $or: [{ brandId: brandId }, { talentId: talentId }] }).sort({ created: -1 })
    .then((response) => {
      res.json({
        status: true,
        data: response,
      });
    })
    .catch((error) => {
      res.json({
        status: false,
      });
    });
};
/**
 ********converstaion by userId******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const conversationByUserId = async (req, res, next) => {
  try {
      const { userId } = req.body;

      if (!userId) {
          return res.status(400).json({
              status: false,
              message: "User ID is required."
          });
      }

      // Find conversations where the user is one of the members
      const conversations = await conversationmodel.find({ members: { $in: [userId] } });

      // If no conversations are found
      if (conversations.length === 0) {
          return res.status(404).json({
              status: false,
              message: "No conversations found for this user."
          });
      }

      const conversationUserData = await Promise.all(
          conversations.map(async (conversation) => {
              // Find the other member who isn't the current user
              const conversationId = conversation.members.find((member) => member !== userId);

              // Attempt to find the receiver in kidsmodel, then in adultmodel
              let user = await kidsmodel.findById(conversationId);
              if (!user) {
                  user = await adultmodel.findById(conversationId);
              }

              if (user) {
                  return {
                      conversationId: conversation._id,
                      user: {
                          email: user.parentEmail || user.adultEmail || null, // Handle undefined fields
                          preferredChildFirstname: user.preferredChildFirstname || null, // Ensure safe access
                      }
                  };
              } else {
                  return {
                      conversationId: conversation._id,
                      user: null // User not found
                  };
              }
          })
      );

      // Return the list of conversations and user information
      return res.json({
          status: true,
          data: conversationUserData
      });
  } catch (error) {
      console.error("Error in conversationByUserId:", error);
      return res.status(500).json({
          status: false,
          message: "Error retrieving conversations.",
          error: error.message
      });
  }
};

/**
 ********listByConversationId******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
//  const listByConversationId = async (req, res, next) => {
//   try {
//     const { conversationId } = req.body;

//     // Validate conversationId is provided
//     if (!conversationId) {
//       return res.status(400).json({
//         status: false,
//         message: "Conversation ID must be provided."
//       });
//     }

//     if (conversationId === 'new') {
//       return res.status(200).json({
//         status: true,
//         data: [],
//         message: "No messages for new conversation."
//       });
//     }

//     const messages = await messagemodel.find({ conversationId });

//     if (!messages.length) {
//       return res.status(404).json({
//         status: true,
//         data: [],
//         message: "No messages found for the given conversation ID."
//       });
//     }

//     const messageUserData = await Promise.all(
//       messages.map(async (message) => {
//         let user = await kidsmodel.findById(message.senderId);
//         if (!user) {
//           user = await adultmodel.findById(message.senderId);
//         }

//         return {
//           user: {
//             email: user?.parentEmail || user?.adultEmail || "No email provided",
//             fullName: user?.preferredChildFirstname || user?.adultName || "Unknown",
//           },
//           message: message.message,
//         };
//       })
//     );

//     res.json({
//       status: true,
//       data: messageUserData
//     });
//   } catch (error) {
//     console.error('Error in listByConversationId:', error);
//     res.status(500).json({
//       status: false,
//       message: "Error retrieving messages.",
//       error: error.message,
//     });
//   }
// };
//correct code
//  const listByConversationId = async (req, res, next) => {
//   try {
//       const conversationId = req.body.conversationId;

//       if (conversationId === 'new') {
//           return res.status(200).json({
//               status: true,
//               data: [],
//               message: "No messages for new conversation."
//           });
//       }

//       const messages = await messagemodel.find({ conversationId });

//       if (messages.length === 0) {
//           return res.status(404).json({
//               status: true,
//               data: [],
//               message: "No messages found for the given conversation ID."
//           });
//       }

//       const messageUserData = await Promise.all(
//           messages.map(async (message) => {
//               let user = await kidsmodel.findById(message.senderId);
//               if (!user) {
//                   user = await adultmodel.findById(message.senderId);
//               }

//               return {
//                   user: {
//                       email: user?.parentEmail || user?.adultEmail,
//                       fullName: user?.preferredChildFirstname || "Unknown",
//                   },
//                   message: message.message, // The content of the message
//               };
//           })
//       );

//       res.json({
//           status: true,
//           data: messageUserData
//       });
//   } catch (error) {
//       res.status(500).json({
//           status: false,
//           message: "Error retrieving messages.",
//           error: error.message,
//       });
//   }
// };

// const listByConversationId = async (req, res, next) => {
//   try {
//     const conversationId = req.params.conversationId; // Use params if ID is part of the URL

//     if (conversationId === 'new') {
//       // If no conversation exists, return an empty array
//       return res.status(200).json({
//         status: true,
//         data: [],
//         message: "No messages for new conversation."
//       });
//     }

//     const messages = await messagemodel.find({ conversationId });

//     if (messages.length === 0) {
//       // Return not found if there are no messages
//       return res.status(404).json({
//         status: true,
//         data: [],
//         message: "No messages found for the given conversation ID."
//       });
//     }

//     const messageUserData = await Promise.all(
//       messages.map(async (message) => {
//         // Fetch user details, checking two different models
//         let user = await kidsmodel.findById(message.senderId);
//         if (!user) {
//           user = await adultmodel.findById(message.senderId);
//         }

//         // Prepare message with user data
//         return {
//           user: {
//             email: user?.parentEmail || user?.adultEmail,
//             fullName: user?.preferredChildFirstname || "Unknown",
//           },
//           message: message.message,
//         };
//       })
//     );

//     // Emit updated data to all connected clients or a specific room
//     io.emit('conversation-update', { conversationId, data: messageUserData });

//     res.json({
//       status: true,
//       data: messageUserData,
//       message: "Messages retrieved successfully."
//     });
//   } catch (error) {
//     console.error("Error retrieving messages:", error);
//     res.status(500).json({
//       status: false,
//       message: "Error retrieving messages.",
//       error: error.message,
//     });
//   }
// };
// Function to retrieve a user based on userId
//  const getUser = (userId) => {
//    return userss.find((user) => user.userId === userId);
//  };

// The updated listByConversationId function
// const listByConversationId = async (req, res) => {
//   try {
//     const conversationId = req.body.conversationId;

//     if (conversationId === 'new') {
//       return res.status(200).json({
//         status: true,
//         data: [],
//         message: "No messages for new conversation."
//       });
//     }

//     const messages = await messagemodel.find({ conversationId });

//     if (messages.length === 0) {
//       return res.status(404).json({
//         status: true,
//         data: [],
//         message: "No messages found for the given conversation ID."
//       });
//     }

//     const messageUserData = await Promise.all(
//       messages.map(async (message) => {
//         const user = getUser(message.senderId); // Use getUser to retrieve socket user
//          console.log("user",user)
//         // Get the corresponding user information from DB models
//         let dbUser = await kidsmodel.findById(message.senderId);
//         if (!dbUser) {
//           dbUser = await adultmodel.findById(message.senderId);
//         }

//         return {
//           user: {
//             email: dbUser?.parentEmail || dbUser?.adultEmail,
//             fullName: dbUser?.preferredChildFirstname || "Unknown",
//             socketId: user?.socketId, // Include socketId if available
//           },
//           message: message.message,
//         };
//       })
//     );

//     // Emit an event with the conversation ID and updated data
//     io.emit('conversation-update', {
//       conversationId,
//       data: messageUserData,
//     });

//     return res.json({
//       status: true,
//       data: messageUserData,
//       message: "Messages retrieved successfully."
//     });
//   } catch (error) {
//     console.error("Error retrieving messages:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Error retrieving messages.",
//       error: error.message,
//     });
//   }
// };
 const listByConversationId = async (req, res) => {
try {
  const conversation = await conversationmodel.find({
    members: { $in: [req.body.userId] },
  });
  res.status(200).json(conversation);
} catch (err) {
  res.status(500).json(err);
}
 }

 //
 const listByConersationOfTwoUsers = async (req, res) => {
 try {
  const conversation = await conversationmodel.findOne({
    members: { $all: [req.body.firstUserId, req.body.secondUserId] },
  });
  res.status(200).json(conversation)
} catch (err) {
  res.status(500).json(err);
}
 }


module.exports = { addConversation,listBrandChat,listTalentChat, listBrandsAndTalent,conversationByUserId,
    listByConversationId,listByConersationOfTwoUsers };