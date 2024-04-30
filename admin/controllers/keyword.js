const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const multer = require("multer");
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


const keywordmodel = require('../models/keywordmodel');

const adultmodel = require('../../users/models/adultmodel.js');
const kidsmodel = require('../../users/models/kidsmodel.js');


/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const postUserSearchKeyword = async (req, res, next) => {
    try {
        console.log(req.body);
        const searchedKeyword = req.body.searchedKeyword.toLowerCase(); // Convert to lowercase
        
        const Add_Keyword = new keywordmodel({
            searchedKeyword: searchedKeyword,
            user_id: req.body.user_id,
            // type: req.body.type, // Assuming you want to save the type as well
            isActive: true
        });

        const response = await Add_Keyword.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Keyword,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};

// const postUserSearchKeyword = async (req, res, next) => {
//     try {
//         console.log(req.body);
//         const Add_Keyword = new keywordmodel({
//             searchedKeyword: req.body.searchedKeyword,
//             user_id:req.body.user_id,
//           //  type:req.body.type,
//             isActive: true
//         });

//         const response = await Add_Keyword.save();

//         return res.json({
//             message: "Added Successfully",
//             status: true,
//             data: Add_Keyword,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.json({
//             message: "An Error Occurred"
//         });
//     }
// };


/**
*********keyword list******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getUserSearchKeyword = async (req, res, next) => {
    const userId = req.body.user_id || req.params.user_id;

    try {
        // Fetch all active keywords for the user
        const response = await keywordmodel.find({ user_id: userId, isActive: true });

        // Extract searchedKeyword values
        const keywords = response.map(item => item.searchedKeyword);

        // Remove duplicate keywords using Set
        const uniqueKeywords = [...new Set(keywords)];

        // Checking if any unique keywords were found
        if (uniqueKeywords.length > 0) {
            res.json({
                status: true,
                data: uniqueKeywords // Return an array of unique searchedKeyword values
            });
        } else {
            res.json({
                status: false,
                msg: "No active keywords found for the user."
            });
        }
    } catch (error) {
        console.error("Error fetching user's search keywords:", error); // Logging the error to the console
        res.json({
            status: false,
            msg: error.message || "An error occurred while fetching the user's search keywords."
        });
    }
};


/**
 *********deleteUserSearchKeyword*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const deleteUserSearchKeyword = async (req, res) => {
    try {
        const { searchedKeyword } = req.body; // Assuming you pass the keyword in the request body

        if (!searchedKeyword) {
            return res.status(400).json({ status: false, msg: 'Missing keyword' });
        }

        // Convert searchedKeyword to lowercase
        const lowerCaseKeyword = searchedKeyword.toLowerCase();

        const updateFields = {
            isActive: false, // Marking the keyword as inactive
        };

        // Update all documents that match the searchedKeyword
        const result = await keywordmodel.updateMany(
            { searchedKeyword: lowerCaseKeyword },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.json({ status: false, msg: 'Keyword not found or already inactive' });
        }

        res.json({ status: true, msg: 'Keywords deleted successfully' });
    } catch (error) {
        console.error('Error:', error); // Log the error
        res.status(500).json({ status: false, msg: error.message });
    }
};



//  const deleteUserSearchKeyword = async (req, res) => {
//     try {
//       const keywordId = req.body.keywordId; // Ensure the keywordId is being passed correctly
  
//       const updateFields = {
//         isActive: false, // Marking the keyword as inactive
//       };
  
//       const result = await keywordmodel.updateOne(
//         { _id: keywordId }, // Directly use the keywordId without conversion
//         { $set: updateFields }
//       );
  
//       if(result.modifiedCount === 0) {
//         return res.json({ status: false, msg: 'Keyword not found or already inactive' });
//       }
  
//       res.json({ status: true, msg: 'Removed successfully' });
//     } catch (error) {
//       console.error(error); // Good practice to log the error
//       res.json({ status: false, msg: error.message });
//     }
//   };
  
  
 

module.exports = {
    postUserSearchKeyword, getUserSearchKeyword,deleteUserSearchKeyword

};