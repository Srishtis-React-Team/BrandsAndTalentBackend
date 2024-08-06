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
    console.log("req.body",req.body)
    const { firstId, secondId,socketId } = req.body

    try {
        const chat = await chatmodel.findOne({
            members: { $all: [firstId, secondId] },
        });
        if (chat) return res.status(200).json(chat);
        const newChat = new chatmodel({
            members: [firstId, secondId],socketId
        })
        console.log("socketId",socketId)
        console.log("newChat",newChat)
        console.log("chat22",chat)

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

        // Collect IDs of other members, excluding the logged-in user's ID, and include chat createdAt timestamps
        const otherMembersWithTimestamps = chats.flatMap(chat =>
            chat.members
                .filter(member => member !== userId)
                .map(member => ({ memberId: member, chatCreatedAt: chat.createdAt }))
        );

        // Get unique member IDs and their latest chatCreatedAt timestamps
        const uniqueMembers = otherMembersWithTimestamps.reduce((acc, { memberId, chatCreatedAt }) => {
            if (!acc[memberId] || new Date(acc[memberId]) < new Date(chatCreatedAt)) {
                acc[memberId] = chatCreatedAt;
            }
            return acc;
        }, {});

        const uniqueMemberIds = Object.keys(uniqueMembers);

        // Ensure the list is not empty after filtering invalid IDs
        if (uniqueMemberIds.length === 0) {
            return res.json({ status: false, data: [] });
        }

        // Find related data for these other members in different models with isActive: true and inActive: true
        const [adults, kids, brands] = await Promise.all([
            adultmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true, inActive: true }),
            kidsmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true, inActive: true }),
            brandsmodel.find({ _id: { $in: uniqueMemberIds }, isActive: true, inActive: true })
        ]);

        // Combine all the data into a single array with their chat createdAt timestamps
        const combinedData = [
            ...adults.map(item => ({ ...item.toObject(), chatCreatedAt: uniqueMembers[item._id.toString()] })),
            ...kids.map(item => ({ ...item.toObject(), chatCreatedAt: uniqueMembers[item._id.toString()] })),
            ...brands.map(item => ({ ...item.toObject(), chatCreatedAt: uniqueMembers[item._id.toString()] }))
        ];

        // Sort the combined data by chatCreatedAt and then reverse it
        combinedData.sort((a, b) => new Date(b.chatCreatedAt) - new Date(a.chatCreatedAt));

        // Send response with the sorted combined data
        res.status(200).json({
            status: true,
            data: combinedData // single array containing all adults, kids, and brands, sorted by chatCreatedAt
        });
    } catch (error) {
        console.error(error); // log the error
        res.status(500).json({ error: 'Internal server error' });
    }
};


/**
 *******filterNames*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const filterNames = async (req, res) => {
    const userId = req.params.userId;
    const { startingSequence } = req.body;

    // Ensure startingSequence is a string (including an empty string)
    if (typeof startingSequence !== 'string') {
        return res.status(200).json({ error: 'Starting sequence must be a string.' });
    }

    try {
        // Fetch all chats where the user is a member
        const chats = await chatmodel.find({ members: { $in: [userId] } });

        // Collect IDs of other members, excluding the current user's ID
        const otherMemberIds = chats.flatMap(chat =>
            chat.members.filter(member => member !== userId)
        );

        // Get unique and valid ObjectIds of other members
        const uniqueMemberIds = [...new Set(otherMemberIds)].filter(id =>
            mongoose.Types.ObjectId.isValid(id)
        );

        if (uniqueMemberIds.length === 0) {
            return res.status(200).json({ error: 'No valid members found' });
        }

        // Define the base query for finding members
        const baseQuery = {
            _id: { $in: uniqueMemberIds },
            isActive: true,
            inActive:true // Assume you want only active members
        };

        // Adjust the query to filter by the starting sequence if it is not empty
        if (startingSequence && startingSequence.length > 0) {
            const regex = new RegExp(`^${startingSequence}`, 'i');
            baseQuery.$or = [
                { 'preferredChildFirstname': regex },
                { 'preferredChildLastName': regex },
                { 'brandName': regex }
            ];
        }

        // Fetch the necessary data from each model
        const [adults, kids, brands] = await Promise.all([
            adultmodel.find(baseQuery),
            kidsmodel.find(baseQuery),
            brandsmodel.find(baseQuery)
        ]);

        // Combine all the data into a single array
        const combinedData = [...adults, ...kids, ...brands];

        // Send the response with the combined data
        res.status(200).json({
            data: combinedData
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports={createChat,findUserChats,findChat,findPreviousChatUsers,filterNames}