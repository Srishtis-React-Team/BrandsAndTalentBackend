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
      return res.status(200).json({
        status: false,
        message: "User ID is required."
      });
    }

    // Find conversations where the user is one of the members
    const conversations = await conversationmodel.find({ members: { $in: [userId] } });

    // If no conversations are found
    if (conversations.length === 0) {
      return res.status(200).json({
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


module.exports = {
  addConversation, listBrandChat, listTalentChat, listBrandsAndTalent, conversationByUserId,
  listByConversationId, listByConersationOfTwoUsers
};