const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const express = require('express');
const chatmodel = require("../models/chatmodel");
const brandsmodel = require('../models/brandsmodel.js');
const kidsmodel = require("../../users/models/kidsmodel.js");
const adultmodel = require("../../users/models/adultmodel.js");
const messagemodel = require("../models/messagemodel.js");

/**
 *********Add Conversation******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const createChat = async (req, res) => {
    const { firstId, secondId } = req.body

    try {
        const chat = await chatmodel.findOne({
            members: { $all: [firstId, secondId] }
        });
        if (chat) return res.status(200).json(chat);
        const newChat = new chatmodel({
            members: [firstId, secondId]
        })

        const response = await newChat.save();
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);

    }
}
/**
 ******findUserChats******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const findUserChats =async(req,res)=>{
    const userId = req.params.userId;
    try{
        const chats=await chatmodel.find({
            members: {$in:[userId]}

        })
        res.status(200).json(chats);
    }catch (error) {
    console.log(error)
    res.status(500).json(error);

}
}
/**
 *******findChat*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const findChat =async(req,res)=>{
    const {firstId,secondId} = req.params;
    try{
        console.log("test chattt",firstId,secondId)
        const chats=await chatmodel.find({
            members: {$all:[firstId,secondId]}

        })
        res.status(200).json(chats);
    }catch (error) {
    console.log(error)
    res.status(500).json(error);

}
}
/**
 *******findPreviousChatUsers*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const findPreviousChatUsers = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch all chats where the user is a member
        const chats = await chatmodel.find({
            members: { $in: [userId] }
        });

        // Collect IDs of other members, excluding the logged-in user's ID
        const otherMemberIds = chats.flatMap(chat =>
            chat.members.filter(member => member !== userId)
        );

        // Get unique IDs to avoid duplicate queries and ensure they're valid ObjectIds
        const uniqueMemberIds = [...new Set(otherMemberIds)].filter(id =>
            mongoose.Types.ObjectId.isValid(id)
        );

        // Ensure the list is not empty after filtering invalid IDs
        if (uniqueMemberIds.length === 0) {
            return res.status(404).json({ error: 'No valid members found' });
        }

        // Find related data for these other members in different models with isActive: true
        const [adults, kids, brands] = await Promise.all([
            adultmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true }),
            kidsmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true }),
            brandsmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true })
        ]);

        // Combine all the data into a single array
        const combinedData = [
            ...adults,
            ...kids,
            ...brands
        ];

        // Send response with the combined data
        res.status(200).json({
            data: combinedData // single array containing all adults, kids, and brands
        });
    } catch (error) {
        console.error(error); // log the error
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports={createChat,findUserChats,findChat,findPreviousChatUsers}