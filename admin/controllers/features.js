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


const featuresmodel = require('../models/featuresmodel');

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addFeatures = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Features = new featuresmodel({
            features: req.body.features,
            isActive: true
        });

        const response = await Add_Features.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Features,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********pricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getFeatures = async (req, res, next) => {

    featuresmodel.find({ isActive: true}).sort({ created: -1 })
        .then((response) => {
            res.json({
                status: true,
                data: response
            });
        })
        .catch((error) => {
            res.json({
                Status: false,
            });
        });
  };

/**
 ******* FileUploadMultiple 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const FileUploadMultiple = (req, res, msg) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ status: false, message: "No file uploaded" });
    }

    // Initialize an array to hold the response data for each file
    let responses = [];

    // Process each file in the req.files array
    req.files.forEach((fileData) => {
        let fileType;

        // Check mimetype and filename extension to determine file type
        if (fileData.mimetype.includes('video')) {
            fileType = 'video';
        } else if (fileData.mimetype.includes('audio')) {
            fileType = 'audio';
        } else if (fileData.mimetype.includes('image')) {
            fileType = 'image';
        } else if (fileData.mimetype.includes('pdf')) {
            fileType = 'pdf';
        } else if (fileData.mimetype.includes('text') || fileData.originalname.endsWith('.txt')) {
            fileType = 'text';
        } else if (fileData.mimetype.includes('doc') || fileData.mimetype.includes('docx')) {
            fileType = 'document';
        } else if (fileData.mimetype.includes('webp')) {
            fileType = 'webp';
        } else {
            fileType = 'unknown';
        }

        // Use the saveFileDetails function to save details for each file
        const fileId = generateUniqueIdentifier(); // Directly use the generated ID
        saveFileDetails(fileData.filename, fileData.originalname, fileType, (err, fileId) => {
            if (err) {
                console.error("Error saving file details:", err); // Log error without stopping the whole process
                return;
            }

            // Append the response for this file to the responses array
            responses.push({
                fileId: fileId,
                filename: fileData.filename,
                originalname: fileData.originalname,
                filetype: fileType,
            });

            // If all files have been processed, send the response
            if (responses.length === req.files.length) {
                res.json({
                    status: true,
                    data: responses,
                    message: "Files Uploaded Successfully",
                });
            }
        });
    });
};


// // Function to save file details in the database
function saveFileDetails(filename, originalname, fileType, callback) {
    // Placeholder function for saving file details in the database
    // Replace this with your actual database saving logic
    // For demonstration purposes, we'll simply generate a unique identifier here
    const fileId = generateUniqueIdentifier();
    // Assuming you have saved the file details, invoke the callback with the fileId
    callback(null, fileId);
}

// Function to generate a unique identifier (placeholder)
function generateUniqueIdentifier() {
    // Placeholder function for generating a unique identifier
    // For demonstration, we'll generate a UUID here
    return uuid();
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "upload1");
    },
    filename: function (req, file, cb) {
      cb(null, uuid() + path.extname(file.originalname));
    },
  });
  
  // Adjusted file size limits
  const maxSize = 100 * 1024 * 1024; // Increased to 100 MB
  const Fieldsize = 10 * 1024 * 1024; // Increased to 10 MB
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize, fieldSize: Fieldsize },
    fileFilter: function (req, file, cb) {
      // Set the filetypes to match video, audio, image, pdf, txt, doc, mov, avi, jpg, jpeg
      var filetypes = /video|audio|image|pdf|txt|doc|mov|avi|jpg|jpeg|mp4|mp3|png|docx|webp/;
      var extname = file.originalname.match(/\.(mp4|mov|avi|mp3|jpg|jpeg|png|pdf|txt|doc|docx|webp)$/i);
      if (extname && filetypes.test(path.extname(file.originalname).toLowerCase())) {
        return cb(null, true);
      }
  
      cb(
        "Error: File upload only supports the following filetypes - " +
        "video, audio, image, pdf, txt, doc, mov, avi, jpg, jpeg"
      );
    },
  }); 



module.exports = {
    addFeatures, getFeatures,FileUploadMultiple, upload

};