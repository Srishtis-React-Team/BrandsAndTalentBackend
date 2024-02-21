const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
var loginData = require('../../emailCredentials.js');
const { gmail: { host, pass } } = loginData;
const nodemailer = require('nodemailer');
const multer = require("multer");
const path = require("path");
const { uuid } = require("uuidv4");



var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});

const adminmodel = require('../models/adminmodel.js');
const  countrymodel = require('../models/countrymodel.js')
const statemodel = require('../models/statemodel.js');

/**
 ********* Add Users******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addAdmin = async (req, res, next) => {
  try {
    console.log(req.body);

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    console.log("hashedPass", hashedPass);

    const adminExist = await adminmodel.findOne({ email: req.body.email });

    if (adminExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exist",
        status: false
      });
    }

    const Add_Admin = new adminmodel({
      name: req.body.name,
      address: req.body.address,
      contactNo: req.body.contactNo,
      email: req.body.email,
      password: hashedPass,
      image: req.body.image,

      
      isActive: true
    });

    const response = await Add_Admin.save();

    return res.json({
      message: "Added Successfully",
      status: true,
      data: Add_Admin,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "An Error Occurred"
    });
  }
};


/**
*********adminLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const adminLogin = async (req, res, next) => {
  const username = req.body.email;
  const password = req.body.password;

  try {
    const user = await adminmodel.findOne({ $or: [{ email: username }, { email: username }] });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = auth.gettoken(user._id, user.email);

        return res.json({
          status: true,
          message: 'Login Successfully',
          data: user,
          token
        });
      } else {
        return res.json({
          status: false,
          message: 'Password does not match'
        });
      }
    } else {
      return res.json({
        status: false,
        message: 'No User Found'
      });
    }
  } catch (error) {
    return res.json({
      status: false,
      message: 'Error during login'
    });
  }
};


/********** userprofile******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const adminProfile = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    const admin = await adminmodel.findOne({ _id: userId, isActive: true });
    if (admin) {
      return res.json({ status: true, data: admin });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Error fetching user profile' });
  }
};

/**
 *********forgot password  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const forgotPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');

    const user = await adminmodel.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });

    const mailOptions = {
      from: host,
      to: req.body.email,
      subject: 'Password Reset',
      text:
        'Hello,\n\n' +
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +

        'token' + ':' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    await transporter.sendMail(mailOptions);

    res.json({
      status: true,
      message: 'An e-mail has been sent to ' + req.body.email + ' with further instructions.'
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'Error during password reset process.'
    });
  }
};


/**
 *********Reset password ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const resetPassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPass);

    const user = await adminmodel.findOne({
      resetPasswordToken: req.body.resetPasswordToken,
      resetPasswordExpires: { $gt: moment(Date.now()) },
    });

    if (!user) {
      return res.json({
        Status: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    console.log("user.Password", hashedPass);
    user.password = hashedPass;

    const mailOptions = {
      from: host,
      to: user.email,
      subject: 'Password Reset',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account has just been changed.\n',
    };

    await transporter.sendMail(mailOptions);

    await user.save();

    res.json({
      status: true,
      message: 'Password Changed Successfully',
    });
  } catch (error) {
    console.error(error);
    res.json({
      message: 'An error occurred during password reset.',
    });
  }
};
/**
 *********Image Upload ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const fileUpload = (req, res, msg) => {
  // Assuming you have a function to save file details in the database
  saveFileDetails(req.file.filename, req.file.originalname, req.file.size, req.file.mimetype, (err, fileId) => {
    if (err) {
      return res.status(500).json({ status: false, message: "Error saving file details" });
    }

    // Determine file type based on mimetype
    let fileType;
    if (req.file.mimetype.includes('video')) {
      fileType = 'video';
    } else if (req.file.mimetype.includes('audio')) {
      fileType = 'audio';
    } else if (req.file.mimetype.includes('image')) {
      fileType = 'image';
    } else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('doc') || req.file.mimetype.includes('txt')||req.file.mimetype.includes('docx')) {
      fileType = 'document';
    } else if (req.file.mimetype.includes('webp') ) {
      fileType = 'webp';
    } 
    else {
      fileType = 'unknown';
    }

    res.json({
      status: true,
      data: {
        fileId: fileId, // Unique identifier for the uploaded file
        filename: req.file.filename,
        originalname: req.file.originalname, // Actual uploaded file name
        filetype: fileType, // File type
      },
      message: "File Uploaded Successfully",
    });
  });
};

// Function to save file details in the database
function saveFileDetails(filename, originalname, size, mimetype, callback) {
  // Logic to save file details in the database goes here
  // This is a placeholder function, you should replace it with actual implementation
  // For example, using an ORM like Mongoose for MongoDB or Sequelize for SQL databases
  // For demonstration purposes, we'll simply generate a unique identifier here
  const fileId = generateUniqueIdentifier();
  // Assuming you have saved the file details, invoke the callback with the fileId
  callback(null, fileId);
}

// Function to generate a unique identifier (placeholder)
function generateUniqueIdentifier() {
  // This is a placeholder function, you should replace it with your actual logic
  // For demonstration, we'll generate a UUID here
  return uuid();
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname));
  },
});

// Adjusted file size limits
const maxSize = 100 * 1024 * 1024; // Increased to 100 MB
const Fieldsize = 10 * 1024 * 1024; // Increased to 10 MB

var uploads = multer({
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
 *******listing country
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const listCountries = async (req, res, next) => {
  const { Country } = require('country-state-city');

  const countries = Country.getAllCountries();

  const countryNames = countries.map(country => country.name);

  res.json({
    status: true,
    data: countryNames
  });
};
/**
 *******listing country
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const addCountry = async (req, res, next) => {
  try {
    const { Country } = require('country-state-city');
    const { v4: uuidv4 } = require('uuid'); // Import uuidv4 for generating unique IDs
    //const CountryModel = require('../models/CountryModel'); // Adjust the path as per your project structure

    const countries = Country.getAllCountries();

    if (!countries || countries.length === 0) {
      throw new Error('No countries found');
    }

    let countryList = [];

    // Loop through the countries array to save each country in the database
    for (const country of countries) {
      // Generate a unique ID for the country
      const countryId = uuidv4();

      // Check if the country with the same ID already exists in the database
      const existingCountry = await countrymodel.findOne({ countryId });

      // If the country doesn't exist, insert it into the database
      if (!existingCountry) {
        await countrymodel.create({
          countryId,
          name: country.name
          // Add more fields if needed
        });
      }

      // Construct country object with ID and name
      const countryObject = {
        countryId,
        name: country.name
      };

      // Push the country object to the list
      countryList.push(countryObject);
    }

    // Save the country list to the database
    await countrymodel.insertMany(countryList);

    res.json({
      status: true,
      data: countryList
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: error.message || 'Error occurred while fetching countries'
    });
  }
};






/**
 *******listing city
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const listCity = async (req, res, next) => {
  const { City } = require('country-state-city');

  const cities = City.getAllCities();

  const cityNames = cities.map(city => city.name);

  res.json({
    status: true,
    data: cityNames
  });
};

/**
 *******listing state 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const listState = async (req, res, next) => {
  try {
    const { State, Country } = require('country-state-city');
    const { v4: uuidv4 } = require('uuid');
    // const CountryModel = require('../models/CountryModel'); // Adjust the path as per your project structure
    // const StateModel = require('../models/StateModel'); // Adjust the path as per your project structure

    const states = State.getAllStates();

    if (!states || states.length === 0) {
      throw new Error('No states found');
    }

    let stateList = [];

    // Create a map of country codes to country names for efficient lookup
    const countryMap = {};
    Country.getAllCountries().forEach(country => {
      countryMap[country.isoCode] = country.name;
    });

    // Loop through the states array to save each state in the database
    for (const state of states) {
      // Generate a unique ID for the state
      const stateId = uuidv4();

      // Get the country name using the country code or set to 'Unknown' if not found
      const countryName = countryMap[state.countryCode] || 'Unknown';

      // Check if the state with the same ID already exists in the database
      const existingState = await statemodel.findOne({ stateId });

      // If the state doesn't exist, insert it into the database
      if (!existingState) {
        await statemodel.create({
          stateId,
          name: state.name,
          countryId: state.countryCode,
          countryName,
          // Add more fields if needed
        });
      }

      // Construct state object with ID, name, country ID, and country name
      const stateObject = {
        stateId,
        name: state.name,
        countryId: state.countryCode,
        countryName,
      };

      // Push the state object to the list
      stateList.push(stateObject);
    }

    // Save the state list to the database
    await statemodel.insertMany(stateList);

    res.json({
      status: true,
      data: stateList
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: error.message || 'Error occurred while fetching states'
    });
  }
};





/**
 ******* listLocation 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const listLocation = async (req, res, next) => {

  statemodel.find({countryName:req.body.countryName}).sort({ created: -1 })
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

//for test
const adminFetch = async (req, res, next) => {

  adminmodel.find({ isActive: true}).sort({ created: -1 })
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




module.exports = {
  addAdmin, adminLogin, adminProfile, forgotPassword, resetPassword, fileUpload, uploads, addCountry, listCity,listState,adminFetch,listLocation,listCountries

};