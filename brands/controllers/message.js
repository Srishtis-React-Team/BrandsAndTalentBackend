const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
//const io = require("../../socket").io;

const messagemodel = require("../models/messagemodel");
const conversationmodel = require("../models/conversationmodel");
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");
const brandsmodel = require("../../brands/models/brandsmodel");



/**
 *********createMesssage ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const createMessage = async (req, res, next) => {
  const{chatId,senderId,text,userImage,currentTime,receiverId,chatFile}=req.body;

  const message = new messagemodel({
    chatId,senderId,text,userImage,currentTime,receiverId,chatFile
  })
 
   try {
     const response = await message.save();
     res.status(200).json(response);
   } catch (err) {
     res.status(500).json(err);
   }
 }
  /**
 *********Add Message******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

 //not use in chat
 const addMessage = async (req, res, next) => {
 const newMessage = new messagemodel(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
}


/**
 *********List Message ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 //not use in chat
const listMessage = async (req, res, next) => {


  const conversationId = req.body.conversationId;

  messagemodel.find({ conversationId: mongoose.Types.ObjectId(conversationId) }).sort({ created: -1 })
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
 *********List users list  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


 const listTalentsForChat = async (req, res, next) => {
  const brandId = req.body.brandId;

  // Check if `brandId` is provided in the request
  if (!brandId) {
    return res.status(400).json({
      status: false,
      message: "Brand ID is required.",
    });
  }

  try {
    // Using Promise.all to find data from both collections
    const results = await Promise.all([
      kidsmodel.find({ brandId: new mongoose.Types.ObjectId(brandId) }).sort({ created: -1 }),
      adultmodel.find({ brandId: new mongoose.Types.ObjectId(brandId) }).sort({ created: -1 }),
    ]);

    // Combine results from both collections
    const combinedResults = [...results[0], ...results[1]];

    res.status(200).json({
      status: true,
      data: combinedResults,
    });
  } catch (error) {
    console.error("Error fetching data:", error); // Optional logging for error
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching data.",
    });
  }
};
 

const listBrandsForChat = async (req, res, next) => {
  try {
    // Fetch data from the brand collection
    const brands = await brandsmodel.find({ isActive: true }).sort({ created: -1 });

    res.status(200).json({
      status: true,
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching brand data.",
    });
  }
};
/**
 *********List users list  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getMessages = async (req, res, next) => {


  const {chatId }= req.params;

 try{
  const messages =await messagemodel.find({chatId});
  res.status(200).json(messages);
 }catch(error)  {
      console.log(error)
      res.status(500).json(error);
 }
};
/**
 *********getMessageByUser ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const getMessageByUser = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Log the correct variable names
    console.log("Fetching messages involving", senderId, "or", receiverId);

    // Retrieve messages where either the senderId or receiverId is one of the provided IDs
    const chats = await messagemodel.find({
      $and: [
        { senderId: { $in: [senderId, receiverId] } },
        { receiverId: { $in: [senderId, receiverId] } }
      ]
    });

    // Send the retrieved chats as a JSON response
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



/***********deleteMessage*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const deleteMessage = async (req, res) => {
  const messageId = req.body.messageId || req.params.messageId;

  // Validate messageId
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ status: false, msg: 'Invalid messageId' });
  }

  try {
    // Delete the message with the given messageId
    await messagemodel.deleteOne({ _id: new mongoose.Types.ObjectId(messageId) });

    res.json({ status: true, msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: false, msg: err.message });
  }
};

    module.exports = { createMessage,getMessages,addMessage, listMessage ,listTalentsForChat,listBrandsForChat,getMessageByUser,deleteMessage};