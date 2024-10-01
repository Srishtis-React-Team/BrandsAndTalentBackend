const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
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

const addFieldDatas = async (req, res, next) => {
  try {
    console.log(req.body);

    // Check if req.body.features is defined and is an array
    if (!Array.isArray(req.body.features)) {
      return res.status(400).json({
        message: "Features must be an array",
        status: false
      });
    }

    let featuresToSave;
    let response;

    if (req.body.type === 'category' || req.body.type === 'profession') {
      // Add unique IDs to each feature for categories and professions
      featuresToSave = req.body.features.map(feature => ({
        id: uuidv4(), // Generate unique ID
        label: feature.label,
        value: feature.value,
        description: feature.description || '' // Include description if present, default to empty string
      }));

      // Create a new document with features and type
      const Add_Features = new featuresmodel({
        features: featuresToSave,
        type: req.body.type,
        isActive: true
      });

      // Save the document
      response = await Add_Features.save();

    } else if (req.body.type === 'gender' || req.body.type === 'nationalities' || req.body.type === 'language') {
      // Create new features entry
      const newFeatures = new featuresmodel({
        isActive: true,
        value: req.body.value,
        label: req.body.label,
        features:req.body.features,
        type: req.body.type
      });

      // Save new features entry to the database
      response = await newFeatures.save();

    } else {
      // For other types, assume features are provided directly
      featuresToSave = req.body.features;

      // Create a new document with features and type
      const Add_Features = new featuresmodel({
        features: featuresToSave,
        type: req.body.type,
        isActive: true
      });

      // Save the document
      response = await Add_Features.save();
    }

    // Return success response
    return res.json({
      message: "Added Successfully",
      status: true,
      data: response
    });
  } catch (error) {
    // Log and return error response
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      status: false
    });
  }
};


/**
*********pricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getFieldDatas = async (req, res, next) => {
  try {
    if (req.body.feature === 'ethnicities') {
      // Fetch the document with type 'features' and isActive: true
      const document = await featuresmodel.findOne({ isActive: true, type: 'features' });

      if (!document) {
        return res.status(200).json({
          status: false,
          message: 'Document not found'
        });
      }

      // Find the ethnicity field
      const ethnicityField = document.features.find(f => f.label === 'Ethnicity');

      if (!ethnicityField) {
        return res.status(200).json({
          status: false,
          message: 'Ethnicity field not found'
        });
      }

      // Send the response with the ethnicity field data
      return res.json({
        status: true,
        data: ethnicityField
      });

    }
    else if (req.body.type === 'features') {
      // Fetch all documents with isActive: true and type 'features'
      const documents = await featuresmodel.find({ isActive: true, type: 'features' }).sort({ createdAt: -1 }).exec();

      if (!documents || documents.length === 0) {
        return res.status(200).json({
          status: false,
          message: 'No documents found'
        });
      }

      // Sort the 'features' array within each document based on the 'label' field, placing 'Ethnicity' and 'Hair Type' at the top
      const sortedResponse = documents.map(doc => {
        const ethnicityField = doc.features.find(f => f.label === 'Ethnicity');
        const hairTypeField = doc.features.find(f => f.label === 'Hair Type');
        
        // Remove 'Ethnicity' and 'Hair Type' from the original list
        const otherFeatures = doc.features.filter(f => f.label !== 'Ethnicity' && f.label !== 'Hair Type');
        
        // Sort the remaining features alphabetically by 'label'
        const sortedFeatures = otherFeatures.sort((a, b) => {
          const labelA = a.label || ''; // Default to empty string if undefined
          const labelB = b.label || ''; // Default to empty string if undefined
          return labelA.localeCompare(labelB);
        });

        // Add 'Ethnicity' and 'Hair Type' at the top, followed by the sorted features
        const featuresWithEthnicityAndHairTypeOnTop = [
          ...(ethnicityField ? [ethnicityField] : []),
          ...(hairTypeField ? [hairTypeField] : []),
          ...sortedFeatures
        ];

        return {
          ...doc._doc,
          features: featuresWithEthnicityAndHairTypeOnTop
        };
      });

      // Reverse the sorted results (if needed)
      const response = sortedResponse.reverse();

      // Send the response with the sorted data
      return res.json({
        status: true,
        data: response
      });

    }
     else {
      // Fetch all documents with isActive: true and type matching req.body.type
      const documents = await featuresmodel.find({ isActive: true, type: req.body.type }).sort({ createdAt: -1 }).exec();

      if (!documents || documents.length === 0) {
        return res.status(200).json({
          status: false,
          message: 'No documents found'
        });
      }

      // Sort the 'features' array within each document based on the 'label' field in alphabetical order
      const sortedResponse = documents.map(doc => {
        return {
          ...doc._doc,
          features: doc.features.sort((a, b) => {
            const labelA = a.label || ''; // Default to empty string if undefined
            const labelB = b.label || ''; // Default to empty string if undefined
            return labelA.localeCompare(labelB);
          })
        };
      });

      // Reverse the sorted results
      const response = sortedResponse.reverse();

      // Send the response with the sorted data
      return res.json({
        status: true,
        data: response
      });
    }
  } catch (error) {
    // Send a 500 status code for any internal server error
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};



/**
 ******* FileUploadMultiple 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const FileUploadMultiple = (req, res, msg) => {
  if (!req.files || req.files.length === 0) {
    return res.status(200).json({ status: false, message: "No file uploaded" });
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

/**
 *********updateFeatures******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const updateFieldDatas = async (req, res, next) => {
  try {

    const { newFeature, updateFeature, type } = req.body;

    const updateOps = {};

    if (type === 'features') {
      // Handle updates for features
      const arrayFilters = [];
      if (updateFeature) {
        updateOps.$set = {
          'features.$[elem].options': updateFeature.options,
          'features.$[elem].label': updateFeature.label,
          'features.$[elem].type': updateFeature.type
        };
        arrayFilters.push({ 'elem.label': updateFeature.oldLabel });
      }

      if (newFeature) {
        updateOps.$push = { features: newFeature };
      }

      // const arrayFilters = updateFeature ? [{ 'elem.label': updateFeature.label }] : [];

      const response = await featuresmodel.updateOne(
        { type: req.body.type },// { _id: new mongoose.Types.ObjectId(_id) },
        updateOps,
        { arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined }
        //  { arrayFilters }
      );

      if (response.matchedCount === 0) {
        return res.status(200).json({
          message: "No document matched",
          status: false
        });
      }

      if (response.modifiedCount === 0) {
        return res.status(200).json({
          message: "No changes made",
          status: false
        });
      }

    } else if (type === 'category' || type === 'profession') {
      // Handle updates for category or profession
      const { updateCategory, newCategory } = req.body;

      if (updateCategory) {
        updateOps.$set = {
          'features.$[elem].label': updateCategory.label,
          'features.$[elem].value': updateCategory.value,
          'features.$[elem].description': updateCategory.description
        };
      }

      if (newCategory) {
        // Generate a unique ID for new categories or professions
        newCategory.id = uuidv4();
        updateOps.$push = { features: newCategory };
      }


      const arrayFilters = updateCategory ? [{ 'elem.id': updateCategory.id }] : [];

      const response = await featuresmodel.updateOne(
        { type: req.body.type },
        updateOps,
        { arrayFilters }
      );

      if (response.matchedCount === 0) {
        return res.status(200).json({
          message: "No document matched",
          status: false
        });
      }

      if (response.modifiedCount === 0) {
        return res.status(200).json({
          message: "No changes made",
          status: false
        });
      }

    } else {
      return res.status(200).json({
        message: "Invalid type specified",
        status: false
      });
    }

    return res.json({
      message: "Updated Successfully",
      status: true,
      data: req.body
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      error: error.message
    });
  }
};


/**
 *********deleteFeatures******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteFieldDatas = async (req, res, next) => {
  try {
    const { id, type, labelToDelete } = req.body;

    let response;

    if (type === 'features') {
      if (!labelToDelete) {
        return res.status(400).json({
          message: "Label to delete is required",
          status: false
        });
      }
      // Handle deletion of a feature by label
      response = await featuresmodel.updateOne(
        { type: 'features' },
        { $pull: { features: { label: labelToDelete } } }
      );
    }
    else if (type === 'profession' || type === 'category') {
      // Handle deletion of a feature by id
      response = await featuresmodel.updateOne(
        { "features.id": id },
        { $pull: { features: { id: id } } }
      );
    } else {
      return res.status(200).json({
        message: "Invalid type specified",
        status: false
      });
    }

    if (response.matchedCount === 0) {
      return res.status(200).json({
        message: "No document matched",
        status: false
      });
    }

    if (response.modifiedCount === 0) {
      return res.status(200).json({
        message: "No changes made",
        status: false
      });
    }

    return res.json({
      message: "Deleted Successfully",
      status: true
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      error: error.message
    });
  }
};

/**
*********get all field Datas******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const getAllDatas = async (req, res, next) => {
  try {
    // Retrieve all documents where isActive is true
    const response = await featuresmodel
      .find({ isActive: true })
      .exec();

    // Sort features within each document based on features.label
    response.forEach(doc => {
      if (doc.features && Array.isArray(doc.features)) {
        doc.features.sort((a, b) => (a.label > b.label ? 1 : -1));
      }
      if (doc.categories && Array.isArray(doc.categories)) {
        doc.categories.sort((a, b) => (a.label > b.label ? 1 : -1));
      }
    });

    res.json({
      status: true,
      data: response
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  addFieldDatas, getFieldDatas, FileUploadMultiple, upload, updateFieldDatas, deleteFieldDatas,
  getAllDatas

};