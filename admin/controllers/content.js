const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import uuid

const contentmodel = require('../models/contentmodel');
/*
*********addContent*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const addContent = async (req, res) => {
    try {
        console.log(req.body);

        let contentItems;

        if (Array.isArray(req.body.items)) {
            contentItems = req.body.items.map(item => ({
                contentType: item.contentType,
                title: item.title,
                uniqueId: uuidv4(), // Generate a unique ID for each item
                description: item.description,
                image: item.image,
                userType:item.userType,
                content:item.content,
                
            }));
        } else {
            contentItems = [{
                contentType: req.body.contentType,
                title: req.body.title,
                uniqueId: uuidv4(), // Generate a unique ID for the item
                description: req.body.description,
                image: req.body.image,
                content:req.body.content,
                userType:req.body.userType,
               
            }];
        }

        const bulkOps = contentItems.map(item => ({
            updateOne: {
                filter: { contentType: item.contentType ,content:item.content},
                update: { $push: { items: item } },
                upsert: true
            }
        }));

        const response = await contentmodel.bulkWrite(bulkOps);

        return res.json({
            message: "Added Successfully",
            status: true,
            data: req.body,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An Error Occurred",
            status: false
        });
    }
};
/*
*********fetchContentByType*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
  
const fetchContentByType = async (req, res) => {
    try {
        const contentType = req.body.contentType;

        // Fetch content items based on contentType
        const content = await contentmodel.findOne({ contentType: contentType });

        if (!content) {
            return res.status(200).json({
                message: "Content not found",
                status: false
            });
        }

        return res.json({
            message: "Content retrieved successfully",
            status: true,
            data: content
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An Error Occurred",
            status: false
        });
    }
};
/*
*********deleteContent*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const deleteContent = async (req, res) => {
    try {
        const uniqueId = req.body.uniqueId;

        // Find the document containing the content item and remove the item
        const response = await contentmodel.updateOne(
            { "items.uniqueId": uniqueId },
            { $pull: { items: { uniqueId: uniqueId } } }
        );

        if (response.nModified === 0) {
            return res.status(200).json({
                message: "Content item not found",
                status: false
            });
        }

        return res.json({
            message: "Content item deleted successfully",
            status: true,
           // data: response
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An Error Occurred",
            status: false
        });
    }
};
/*
*********editContent*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const editContent = async (req, res) => {
    try {
        if (req.body.contentType === 'faq' || req.body.contentType === 'How It works') {
            const uniqueId = req.body.uniqueId;
            const updateFields = req.body;
    
            // Build the update object only with the provided fields
            let updateObject = {};
            for (let key in updateFields) {
                if (key !== 'uniqueId') {
                    updateObject[`items.$.${key}`] = updateFields[key];
                }
            }
    
            // Ensure uniqueId remains unchanged
            updateObject[`items.$.uniqueId`] = uniqueId;
    
            // Find the document containing the content item and update the item
            const response = await contentmodel.updateOne(
                { "items.uniqueId": uniqueId },
                { $set: updateObject }
            );
    
            if (response.nModified === 0) {
                return res.status(200).json({
                    message: "Content item not found",
                    status: false
                });
            }
    

            return res.json({
                message: "Content item updated successfully",
                status: true,
            });
        } else {
            const { uniqueId, content } = req.body;

            // Validate if uniqueId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
                return res.status(400).json({
                    message: "Invalid uniqueId format",
                    status: false
                });
            }

            // Update the content field of the document
            const updatedContent = await contentmodel.findByIdAndUpdate(
                uniqueId,
                { content: content },
                { new: true } // Return the updated document
            );

            if (!updatedContent) {
                return res.status(404).json({
                    message: "Content document not found",
                    status: false
                });
            }

            return res.json({
                message: "Content document updated successfully",
                status: true,
                data: updatedContent
            });
        }
    } catch (error) {
        console.error("Error occurred while updating content:", error);
        return res.status(500).json({
            message: "An error occurred",
            status: false
        });
    }
};

// const editContent = async (req, res) => {
//     try {
//         const uniqueId = req.body.uniqueId;
//         const updateFields = req.body;

//         // Build the update object only with the provided fields
//         let updateObject = {};
//         for (let key in updateFields) {
//             if (key !== 'uniqueId') {
//                 updateObject[`items.$.${key}`] = updateFields[key];
//             }
//         }

//         // Ensure uniqueId remains unchanged
//         updateObject[`items.$.uniqueId`] = uniqueId;

//         // Find the document containing the content item and update the item
//         const response = await contentmodel.updateOne(
//             { "items.uniqueId": uniqueId },
//             { $set: updateObject }
//         );

//         if (response.nModified === 0) {
//             return res.status(200).json({
//                 message: "Content item not found",
//                 status: false
//             });
//         }

//         return res.json({
//             message: "Content item updated successfully",
//             status: true,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "An Error Occurred",
//             status: false
//         });
//     }
// };


module.exports = {
    addContent,fetchContentByType,deleteContent,editContent
  
  };
