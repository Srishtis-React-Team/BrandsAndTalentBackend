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
const { chatAdultTemplate } = require('../../template.js');
const { chatKidsTemplate } = require('../../template.js');
const { chatBrandsTemplate } = require('../../template.js');
const cron = require('node-cron');

const brandsmodel = require('../../brands/models/brandsmodel.js');
const kidsmodel = require("../../users/models/kidsmodel.js");
const adultmodel = require("../../users/models/adultmodel.js");
const { Country, State, City } = require('country-state-city');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');


const draftmodel = require("../../brands/models/draftmodel.js");


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});

const adminmodel = require('../models/adminmodel.js');
const countrymodel = require('../models/countrymodel.js')
const statemodel = require('../models/statemodel.js');
const notificationmodel = require("../../brands/models/notificationmodel.js");
const successStoryModel = require('../models/successStoriesmodel.js');
const logomodel = require("../models/logomodel.js");
const successStoriesmodel = require("../models/successStoriesmodel.js");


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
      userType:req.body.userType,
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
    //for globally auth decalration use this 
    const userId = req.body.user_id || req.params.user_id;

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
      html: `
      <p>Hello,</p>
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link to complete the process:</p>
      <p><a href="https://brandsandtalent.com/admin/reset-password?token=${token}"><b><u>Reset Password</u></b></a></p>
      <p>Otherwise, your token is: <strong>${token}</strong></p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
    
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
    } else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('doc') || req.file.mimetype.includes('txt') || req.file.mimetype.includes('docx')) {
      fileType = 'document';
    } else if (req.file.mimetype.includes('webp')) {
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
    var filetypes = /video|audio|image|pdf|txt|doc|mov|avi|jpg|jpeg|mp4|mp3|png|docx|webp|jfif/;
    var extname = file.originalname.match(/\.(mp4|mov|avi|mp3|jpg|jpeg|png|pdf|txt|doc|docx|webp|jfif)$/i);
    if (extname && filetypes.test(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the following filetypes - " +
      "video, audio, image, pdf, txt, doc, mov, avi, jpg, jpeg,jfif,webp"
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

  // Get all countries from the library
  const countries = Country.getAllCountries();

  // Extract the country names from the fetched data
  const countryName = countries.map(country => country.name);

  // Define the array with specific country names you want to exclude
  const arr=["Aland Islands", "American Samoa", "Anguilla", "Antarctica", "Aruba", "Bermuda", "Bonaire, Sint Eustatius and Saba", "Bouvet Island", "British Indian Ocean Territory", "Cayman Islands", "Christmas Island", "Cocos (Keeling) Islands", "Cook Islands", "Cote D'Ivoire (Ivory Coast)", "Curaçao", "East Timor", "Falkland Islands", "Faroe Islands", "French Guiana", "French Polynesia", "French Southern Territories", "Gibraltar", "Greenland", "Guadeloupe", "Guam", "Heard Island and McDonald Islands", "Hong Kong S.A.R.", "Jersey", "Kosovo", "Macau S.A.R.", "Macedonia", "Man (Isle of)", "Martinique", "Mayotte", "Montserrat", "New Caledonia", "Niue", "Norfolk Island", "Northern Mariana Islands", "Palestinian Territory Occupied", "Puerto Rico", "Reunion", "Saint Pierre and Miquelon", "Saint-Barthelemy", "Saint-Martin (French part)", "Sint Maarten (Dutch part)", "South Georgia", "Tokelau", "Turks And Caicos Islands", "United States Minor Outlying Islands", "Virgin Islands (British)", "Virgin Islands (US)", "Wallis And Futuna Islands", "Western Sahara"]

  // Filter out the countryNames that are in the `arr`
  const countryNames = countryName.filter(country => !arr.includes(country));

 

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

  statemodel.find({ countryName: req.body.countryName }).sort({ created: -1 })
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
 ******* listLocation 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/




const listCity = async (req, res, next) => {
  try {
    const { countryName, stateName } = req.body;

    // First, find the ISO code for the country
    const countryISO = Country.getAllCountries().find(country => country.name === countryName)?.isoCode;

    if (!countryISO) {
      return res.status(200).json({ status: false, message: 'Country not found' });
    }

    // Then, find the ISO code for the state within that country
    const stateISO = State.getStatesOfCountry(countryISO).find(state => state.name === stateName)?.isoCode;

    if (!stateISO) {
      return res.status(200).json({ status: false, message: 'State not found' });
    }

    // Now, list all cities for the found state ISO code
    const cities = City.getCitiesOfState(countryISO, stateISO);

    res.json({ status: true, data: cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error occurred while fetching cities' });
  }
};
/**
 ******* adminFetch 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const adminFetch = async (req, res, next) => {

  adminmodel.find({ isActive: true }).sort({ created: -1 })
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
 ******* chatbot 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

function getCurrentTimeInCambodia() {
  const now = new Date(); // Current date and time
  const cambodiaTimeOffset = 7 * 60; // Cambodia is UTC+7, in minutes
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + cambodiaTimeOffset); // Adjust to Cambodia time

  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Format AM or PM
  const amPm = hours >= 12 ? 'PM' : 'AM';
  // Convert 24-hour time to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  // Rounds down minutes to the nearest lower whole number, so 60 becomes 59.
  minutes = minutes === 60 ? 59 : minutes;

  // Format hours and minutes
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amPm}`;
}
function formatResponse(botResponse, userMsg, sessionId) {
  return {
    time: getCurrentTimeInCambodia(),
    botResponse: botResponse,
    userMsg: userMsg,
    sectionID: sessionId // Placeholder for sectionID, replace with actual value if available
  };
}



//28/3
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
let sessions = {}; // Simulated session storage


const chatbot = async (req, res) => {
  const { message, sessionId } = req.body; // Assuming the client sends a sessionId
  let botResponse;
  let userMsg = req.body.message;
  console.log("req.body", req.body)

  // Initialize or retrieve the session
  if (!sessions[sessionId]) {
    sessions[sessionId] = { interactionStep: 0 }; // New session
  }
  let interactionStep = sessions[sessionId].interactionStep;

  switch (interactionStep) {
    // case 0:
    //   botResponse = "How can I help you ?";
    //   interactionStep++;
    //   break;
    case 0:
      botResponse = "Could you please share your email address with me ? ";
      interactionStep++;
      break;
    case 1:
      if (isValidEmail(userMsg)) {
        botResponse = "What is your fullname? ";
        // Proceed with the next step or interaction
        interactionStep++;
      } else {
        botResponse = "It seems like the email address is not valid. Could you please check and enter it again?";
        // Optionally, you might not increment 'interactionStep' to allow the user to try again
      }
      break;

    case 2:
      userName = message; // Store the user's name

      botResponse = `Are you Brands/Client/Talent? Please enter 1 for Brand ,2 for Client ,3 for Talent `;
      interactionStep++;
      break;
    case 3:
      type = userMsg
      console.log("type", type)
      //type = response.toLowerCase();
      if (type == 1 || type == 2) {
        // if (type.toLowerCase() === '1' || type.toLowerCase() === '2') {
        botResponse = chatBrandsTemplate();
        interactionStep = 4;
      } else if (type == 3) {
        //else if (type.toLowerCase() === '3') {
        botResponse = `${userName}, how old are you?`;
      }

      else {
        botResponse = "For further assistance, contact brandstalent123@gmail.com.";
      }
      interactionStep++;
      break;
    case 4:
      userAge = parseInt(message); // Store the user's age
      if (isNaN(userAge)) {
        botResponse = "I couldn't understand that. Can you please tell me how old you are in numbers? ";
      } else {
        if (userAge < 18) {
          // Use the chatKidsTemplate function here to generate the response for kids
          botResponse = chatKidsTemplate();

        } else {
          // Use the chatAdultTemplate function here to generate the response for adults
          botResponse = chatAdultTemplate();
        }
        interactionStep++; // Move to the next step
      }
      break;
    case 5:
      // Handle user's request or question here. For simplicity, we move to satisfaction check.
      botResponse = "Are you satisfied with this section yes/no?";
      interactionStep++;
      break;
    // Add other cases here following your original logic
    case 6:
      if (message.toLowerCase() === "yes") {
        botResponse = "Thank you for chatting with us. Have a great day!";
      } else {
        botResponse = "For further assistance, contact brandstalent123@gmail.com.";
      }
      // Instead of resetting to 0 here, we reset when a new session starts
      break;
    default:
      botResponse = "I'm not sure how to respond to that. Can you try asking something else? For more help, contact us at brandstalent123@gmail.com.";
      interactionStep = 0; // Reset for new or unrecognized sessions
      break;
  }

  // Update the session
  sessions[sessionId].interactionStep = interactionStep;
  const formattedResponse = formatResponse(botResponse, userMsg, sessionId)

  res.json(formattedResponse);
  //res.json({ message: formatResponse(botResponse, userMsg,sessionId) });
};



/**
 ******* getAllStates 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getAllStatesList = async (req, res, next) => {
  try {
    const { State, Country } = require('country-state-city');

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

    // Loop through the states array to construct state objects
    for (const state of states) {
      // Get the country name using the country code or set to 'Unknown' if not found
      const countryName = countryMap[state.countryCode] || 'Unknown';

      // Construct state object with name, country ID, and country name
      const stateObject = {
        name: state.name,
        countryId: state.countryCode,
        countryName,
      };

      // Push the state object to the list
      stateList.push(stateObject);
    }

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
 ******* getAllCities 
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getAllCitiesList = async (req, res, next) => {
  try {
    const { City } = require('country-state-city');

    const cities = City.getAllCities();

    if (!cities || cities.length === 0) {
      throw new Error('No cities found');
    }

    let cityList = [];

    // Loop through the cities array to construct city objects
    for (const city of cities) {
      // Construct city object with name, state ID, state name, country ID, and country name
      const cityObject = {
        name: city.name,
        stateId: city.stateCode,
        countryId: city.countryCode,
      };

      // Push the city object to the list
      cityList.push(cityObject);
    }

    res.json({
      status: true,
      data: cityList
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: error.message || 'Error occurred while fetching cities'
    });
  }
};

/*
*********adminApproval*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const RejectedVerificationEmail = (userEmail) => {
  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Admin Rejected Notification',
    html: `
    <h1>Sorry!</h1>
    <p>Your profile has been rejected by the admin</p>
    <p>For further information contact us</p>
    <p>Best Regards,<br>Admin Team</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};


const sendApprovalEmail = (userEmail) => {
  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Admin Approval Notification',
    html: `
    <h1>Congratulations!</h1>
    <p>Your profile has been approved by the admin and also your id proof has removed</p>
    <p>Thank you for being a part of our community.</p>
    <p>Best Regards,<br>Admin Team</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};
const adminApproval = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    const { adminApproved, status, id } = req.body;

    let userType = '';
    let updateResult = null;
    let userEmail = '';

    // Function to remove verificationId
    const removeVerificationId = async (model, id) => {
      return await model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $unset: { verificationId: "" } }
      );
    };

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
    if (req.body.adminApproved == 'true') {


      if (adultUser) {
        userType = 'adults';
        userEmail = adultUser.email; // Assuming email field exists in adultmodel
        updateResult = await adultmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: adminApproved, status: status } }
        );
        await notificationmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { $set: { adminApproved: adminApproved, status: status } }
        );
        await removeVerificationId(adultmodel, userId);
      } else {
        // If not found in adultmodel, check in kidsmodel
        const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
        if (kidUser) {
          userType = 'kids';
          userEmail = kidUser.parentEmail; // Assuming parentEmail field exists in kidsmodel
          updateResult = await kidsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
          );

          await notificationmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { adminApproved: adminApproved, status: status } }
          );

          await removeVerificationId(kidsmodel, userId);
        }

      }
    } else {
      if (adultUser) {
        userType = 'adults';
        userEmail = adultUser.email; // Assuming email field exists in adultmodel
        updateResult = await adultmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
        );

        await notificationmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { $set: { adminApproved: adminApproved, status: status } }
        );

      } else {
        // If not found in adultmodel, check in kidsmodel
        const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
        if (kidUser) {
          userType = 'kids';
          userEmail = kidUser.parentEmail; // Assuming parentEmail field exists in kidsmodel
          updateResult = await kidsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
          );

          await notificationmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { adminApproved: adminApproved, status: status } }
          );


        }

      }

    }

    // If user type is still empty, user was not found in any model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // If we have an update result, we successfully updated the profile status
    if (updateResult) {
      console.log("updateResultfinal", updateResult)
      if (userEmail) {
        if (req.body.status === "Approved") {
          sendApprovalEmail(userEmail);
        }
        else {
          RejectedVerificationEmail(userEmail);
        }

      }
      return res.json({ status: true, msg: 'Approved successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to Approval' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

/*
*********jobApproval*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const RejectedApprovalEmail = (userEmail) => {


  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Admin Reject Notification',
    html: `
    <h1>Sorry!</h1>
    <p>Your job has been rejected by the admin.</p>
    <p>For further information contact us.</p>
    <p>Best Regards,<br>Admin Team</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};

const sendJobApprovalEmail = (userEmail) => {

  console.log("vdskjfvjkdsv")
  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Admin Approval Notification',
    html: `
    <h1>Congratulations!</h1>
    <p>Your profile has been approved by the admin.</p>
    <p>You need to post the job through this link. Please click here: <a href="https://brandsandtalent.com/list-jobs"><strong><u>Post Job</u></strong></a></p>
    <p>Thank you for being a part of our community.</p>
    <p>Best Regards,<br>Admin Team</p>`
    
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};
// Define the function to get user email
const getUserEmail = async (userId) => {
  try {
    // Assuming you have a UserModel and an email field
    const user = await brandsmodel.findById(userId);
    if (user) {
      return user.email;
    } else {
      console.log("User not found with ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user email:", error);
    return null;
  }
};
// Function to send notifications using FCM
const sendNotificationsToAdmin = async (fcmToken, title, text) => {
  if (!fcmToken) {
    console.error("FCM Token is required");
    return;
  }

  const notification = {
    title,
    text,
  };

  const notification_body = {
    notification: notification,
    to: fcmToken
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
      headers: {
        'Authorization': 'key=' + 'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Use environment variable for server key
        'Content-Type': 'application/json'
      }
    });

    console.log("Notification sent successfully", response.data);
  } catch (error) {
    console.error("Error sending notification", error.response ? error.response.data : error.message);
  }
};

// Function to save notifications to the database
const saveNotificationToAdmin = async (brandId, gigId, notificationMessage) => {
  try {
    // Fetch details of brand and gig
    const brand = await findUserById(brandId);
    const gig = await gigsmodel.findById(gigId);

    // Create the notification document
    const notification = new notificationmodel({
      notificationType: 'Reminder For Approve Job',
      brandId: brandId,
      gigId: gigId,
      notificationMessage: notificationMessage,
      brandDetails: {
        _id: brand._id,
        brandName: brand.brandName,
        brandEmail: brand.brandEmail,
        logo: brand.logo,
        brandImage: brand.brandImage
      },
      gigDetails: {
        jobTitle: gig.jobTitle,
        category: gig.category,
        minAge: gig.minAge,
        maxAge: gig.maxAge,
        instaMin: gig.instaMin,
        instaMax: gig.instaMax,
        tikTokMin: gig.tikTokMin,
        tikTokMax: gig.tikTokMax,
        linkedInMin: gig.linkedInMin,
        linkedInMax: gig.linkedInMax,
        fbMin: gig.fbMin,
        fbMax: gig.fbMax,
        twitterMin: gig.twitterMin,
        twitterMax: gig.twitterMax,
        youTubeMin: gig.youTubeMin,
        youTubeMax: gig.youTubeMax
      }
    });

    // Save the notification document
    const savedNotification = await notification.save();
    console.log("Notification saved successfully", savedNotification);
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};


const jobApproval = async (req, res) => {
  try {
    console.log('inside jobApproval---------------')
    const userId = req.body.user_id || req.params.user_id;
    const gigId = req.body.gigId;
    const id = req.body.id;
    const status = req.body.status;
    const adminApproved = req.body.adminApproved;


    let userType = '';
    let updateResult = null;
    let userEmail = '';

    // Check in brandsmodel
    const brandsUser = await brandsmodel.findOne({ _id: userId, isActive: true });
    console.log('brandsUser', brandsUser)
    if (brandsUser) {
      console.log('inside if')
      userType = 'brands';
      userEmail = brandsUser.brandEmail;
      console.log('gigId', gigId)
      const draftJob = await draftmodel.findOne({ _id: gigId });
      console.log('draftJob', draftJob)
      if (brandsUser.planName === 'Basic') {
        console.log("updateResulttest1");
        console.log("draftJob", !draftJob.adminApproved)

        if (draftJob && !draftJob.adminApproved) {
          console.log("cronnn")

          const createdAt = draftJob.createdAt;
          const now = new Date();


          // Check if the job was created within the last 48 hours
          if ((now - createdAt) <= 48 * 60 * 60 * 1000) {
            console.log("created not cron")
            // If job created within 48 hours, directly update adminApproved to true
            updateResult = await draftmodel.updateOne({ _id: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
            await notificationmodel.updateOne({ _id: id }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
            console.log("updateResultnormla", updateResult);
          } else {
            console.log("cron")
            // If job not created within 48 hours, schedule cron job to update adminApproved
            cron.schedule('0 * * * *', async () => {
              try {
                const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000);
                const draftJobs = await draftmodel.find({ createdAt: { $lt: fortyEightHoursAgo }, adminApproved: false, status: 'Pending' });
                for (const job of draftJobs) {
                  // Send notifications and save them to the notification table
                  const jobalert = `
        <html>
          <body>
            <p>Reminder: A Job  <strong>${job.jobTitle}</strong> pending for approval in <strong>${job.jobLocation}</strong> Please approve them.</p>
          </body>
        </html>
      `
                  const admin = await adminmodel.find({
                    email: { $in: ['info@brandsandtalent.com', 'olin@brandsandtalent.com'] }
                  });

                  await sendNotificationsToAdmin(admin.fcmToken, 'Reminder For Approve Job', jobalert);
                  await saveNotificationToAdmin(brandsUser._id, gigId._id, jobalert);
                }
                
              } catch (error) {
                console.error('Error processing cron job:', error);
              }
            });
          }
        }
      } else {

        // If the plan is not 'Basic', directly update adminApproved to true
        updateResult = await draftmodel.updateOne({ _id: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });

        await notificationmodel.updateOne({ _id: id }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
        console.log("updateResultnot basic", updateResult);
      }
    }

    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    if (updateResult) {
      console.log("updateResultfinal", updateResult)
      if (userEmail) {
        if (req.body.status === "Approved") {
          sendJobApprovalEmail(userEmail);
        }
        else {
          RejectedApprovalEmail(userEmail);
        }

      }
      return res.json({ status: true, msg: ' Updated successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to approve' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Error Occured' });
  }
};


/*
*********Notapprovedmembers*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const notApprovedMembers = async (req, res) => {
  try {
    const adultUsers = await adultmodel.find({ adminApproved: false, isActive: true });
    const kidUsers = await kidsmodel.find({ adminApproved: false, isActive: true });
    //const brandsUsers = await brandsmodel.find({ adminApproved: false,isActive:true });

    // Combine all not approved users into a single array
    const notApprovedUsers = [];
    notApprovedUsers.push(...adultUsers);
    notApprovedUsers.push(...kidUsers);
    // notApprovedUsers.push(...brandsUsers);

    return res.json({ status: true, notApprovedUsers });
  } catch (error) {
    console.error('Error fetching not approved members:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

/*
*********ListBrandForJobPost*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const ListBrandForJobPost = async (req, res) => {
  try {
    // Fetch active brands from draftmodel
    const draftBrands = await draftmodel.find({ isActive: true, brandId: req.body.brandId, adminApproved: false })//.select({ brandId: 1 });

    // Extract brandIds from draftBrands
    const brandIds = draftBrands.map(draft => draft.brandId);

    // Fetch brand details from brandsmodel using the brandIds
    const brandDetails = await brandsmodel.find({
      _id: { $in: brandIds }
    }).select({ _id: 1, planName: 1 }); // Assuming 'otherDetails' is a placeholder for other required fields

    return res.json({ status: true, brandDetails });
  } catch (error) {
    console.error('Error fetching brand details for job post:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};


/*
*********filterByStatus*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const filterByStatus = async (req, res) => {
  try {
    let users = [];
    const notificationTypes = ['Job Approval', 'Talent Verification Approval', 'Talent Profile Approval','Review Notification'];

    if (req.body.notificationType === 'All' && req.body.status === 'All') {
      // Fetch all notifications regardless of their status
      users = await notificationmodel.find({
        notificationType: { $in: notificationTypes },
        isActive: true
      });
    } else if (req.body.notificationType === 'All') {
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
          notificationType: { $in: notificationTypes },
          isActive: true,
         // adminApproved: true,
          status: 'Approved'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
          notificationType: { $in: notificationTypes },
          isActive: true,
        //  adminApproved: false,
          status: 'Rejected'
        });
      } else if (req.body.status === 'Pending') {
        console.log("vjdvjvbfbfjkbgfn",)
        users = await notificationmodel.find({
          notificationType: { $in: notificationTypes },
          isActive: true,
         // adminApproved: false,
          status: 'Pending'
        });
      }
    } else if (req.body.notificationType === 'Talent Profile Approval') {
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
        //  notificationType: { $in: notificationTypes },
        notificationType: 'Talent Profile Approval',
          isActive: true,
         // adminApproved: true,
          profileApprove: true,
          status: 'Approved'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
       //   notificationType: { $in: notificationTypes },
       notificationType: 'Talent Profile Approval',
          isActive: true,
        //  adminApproved: false,
          profileApprove: false,
          status: 'Rejected'
        });
      } else if (req.body.status === 'Pending') {
      
        users = await notificationmodel.find({
        //  notificationType: { $in: notificationTypes },
        notificationType: 'Talent Profile Approval',
          isActive: true,
       //   adminApproved: false,
          profileApprove: false,
          status: 'Pending'
        });
      }
      else if (req.body.status === 'All') {
       
        users = await notificationmodel.find({
        //  notificationType: { $in: notificationTypes },
        notificationType: 'Talent Profile Approval',
          isActive: true,
       //   adminApproved: false,
         
        });
      }
    } 
    else if (req.body.notificationType === 'Talent Verification Approval') {
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
        //  notificationType: { $in: notificationTypes },
        notificationType:'Talent Verification Approval',
          isActive: true,
        //  adminApproved: true,
          profileApprove: true,
          status: 'Approved'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
       //   notificationType: { $in: notificationTypes },
       notificationType:'Talent Verification Approval',
          isActive: true,
         // adminApproved: false,
          profileApprove: false,
          status: 'Rejected'
        });
      } else if (req.body.status === 'Pending') {
        
        users = await notificationmodel.find({
         // notificationType: { $in: notificationTypes },
         notificationType:'Talent Verification Approval',
          isActive: true,
         
          profileApprove: false,
          status: 'Pending'
        });
      }
      else if (req.body.status === 'All') {
       
        users = await notificationmodel.find({
          notificationType:'Talent Verification Approval', //{ $in: notificationTypes },
          isActive: true,
        
        });
      }
    } 
    else if (req.body.notificationType === 'Job Approval') {
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
        //  notificationType: { $in: notificationTypes },
        notificationType:'Job Approval',
          isActive: true,
          adminApproved: true,
         // profileApprove: true,
          status: 'Approved'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
       //   notificationType: { $in: notificationTypes },
       notificationType:'Job Approval',
          isActive: true,
          adminApproved: false,
         // profileApprove: false,
          status: 'Rejected'
        });
      } else if (req.body.status === 'Pending') {
        
        users = await notificationmodel.find({
         // notificationType: { $in: notificationTypes },
         notificationType:'Job Approval',
          isActive: true,
          adminApproved: false,
         // profileApprove: false,
          status: 'Pending'
        });
      }
      else if (req.body.status === 'All') {
        
        users = await notificationmodel.find({
         // notificationType: { $in: notificationTypes },
         notificationType:'Job Approval',
          isActive: true,
        
        });
      }
    }else if (req.body.notificationType === 'Review Notification') {

     
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
         
          isActive: true,
          reviewApproved: 'Approved',
          notificationType:'Review Notification'
        });
      } 
      else if (req.body.status === 'All') {
        users = await notificationmodel.find({
         // notificationType: { $in: notificationTypes },
          isActive: true,
          notificationType:'Review Notification'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
         // notificationType: { $in: notificationTypes },
          isActive: true,
          reviewApproved: 'Rejected',
          notificationType:'Review Notification'
        });
      } else if (req.body.status === 'Pending') {
        console.log("vjdvjvbfbfjkbgfn",)
        users = await notificationmodel.find({
          //notificationType: { $in: notificationTypes },
          isActive: true,
          reviewApproved: 'Pending',
          notificationType:'Review Notification'
        });
      }
     
    } else if (req.body.status === 'All') {
      users = await notificationmodel.find({
        notificationType: req.body.notificationType,
        isActive: true
      });
    } else {
      if (req.body.status === 'Approved') {
        users = await notificationmodel.find({
          notificationType: req.body.notificationType,
          isActive: true,
          adminApproved: true,
          status: 'Approved',
          reviewApproved: 'Approved'
        });
      } else if (req.body.status === 'Rejected') {
        users = await notificationmodel.find({
          notificationType: req.body.notificationType,
          isActive: true,
          adminApproved: false,
          status: 'Rejected',
          reviewApproved: 'Rejected'
        });
      } else if (req.body.status === 'Pending') {
        users = await notificationmodel.find({
          notificationType: req.body.notificationType,
          isActive: true,
          adminApproved: false,
          status: 'Pending',
          reviewApproved: 'Pending'
        });
      }
    }
    // Reverse the users array
    users.reverse();
    return res.json({ status: true, data: users });
  } catch (error) {
    console.error('Error fetching filtered members:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

/*
*********approvethroughBrandslist*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const jobApprovalByBrandsList = async (req, res) => {
  try {
   
    const userId = req.body.user_id || req.params.user_id;
    const gigId = req.body.gigId;

    const status = req.body.status;
    const adminApproved = req.body.adminApproved;


    let userType = '';
    let updateResult = null;
    let userEmail = '';

    // Check in brandsmodel
    const brandsUser = await brandsmodel.findOne({ _id: userId, isActive: true });
   
    if (brandsUser) {
     
      userType = 'brands';
      userEmail = brandsUser.brandEmail;
     
      const draftJob = await draftmodel.findOne({ _id: gigId });
      
      if (brandsUser.planName === 'Basic') {
        console.log("updateResulttest1");
        console.log("draftJob", !draftJob.adminApproved)

        if (draftJob && !draftJob.adminApproved) {
        

          const createdAt = draftJob.createdAt;
          const now = new Date();


          // Check if the job was created within the last 48 hours
          if ((now - createdAt) <= 48 * 60 * 60 * 1000) {
          
            // If job created within 48 hours, directly update adminApproved to true
            updateResult = await draftmodel.updateOne({ _id: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
            await notificationmodel.updateOne({ gigId: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
            console.log("updateResultnormla", updateResult);
          } else {
           
            // If job not created within 48 hours, schedule cron job to update adminApproved
            cron.schedule('0 * * * *', async () => {
              try {
                const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000);
                const draftJobs = await draftmodel.find({ createdAt: { $lt: fortyEightHoursAgo }, adminApproved: false, status: 'Pending' });
                for (const job of draftJobs) {
                  // Send notifications and save them to the notification table
                  const jobalert = `
        <html>
          <body>
            <p>Reminder: A Job  <strong>${job.jobTitle}</strong> pending for approval in <strong>${job.jobLocation}</strong> Please approve them.</p>
          </body>
        </html>
      `;
                  const admin = await adminmodel.find({
                    email: { $in: ['info@brandsandtalent.com', 'olin@brandsandtalent.com'] }
                  });

                  await sendNotificationsToAdmin(admin.fcmToken, 'Reminder For Approve Job', jobalert);
                  await saveNotificationToAdmin(brandsUser._id, gigId._id, jobalert);
                }

              } catch (error) {
                console.error('Error processing cron job:', error);
              }
            });
          }
        }
      } else {

        // If the plan is not 'Basic', directly update adminApproved to true
        updateResult = await draftmodel.updateOne({ _id: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });

        await notificationmodel.updateOne({ gigId: gigId }, { $set: { adminApproved: req.body.adminApproved, status: req.body.status } });
        console.log("updateResultnot basic", updateResult);
      }
    }

    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    if (updateResult) {
      console.log("updateResultfinal", updateResult)
      if (userEmail) {
        if (req.body.status === "Approved") {
          sendJobApprovalEmail(userEmail);
        }
        else {
          RejectedApprovalEmail(userEmail);
        }

      }
      return res.json({ status: true, msg: ' Updated successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to approve' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Error Occured' });
  }
};


/*
*********adminApproval*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/




const adminApprovalByList = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    const { adminApproved, status } = req.body;

    let userType = '';
    let updateResult = null;
    let userEmail = '';

    // Function to remove verificationId
    const removeVerificationId = async (model, id) => {
      return await model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $unset: { verificationId: "" } }
      );
    };

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
    if (req.body.adminApproved == 'true') {


      if (adultUser) {
        userType = 'adults';
        userEmail = adultUser.email; // Assuming email field exists in adultmodel
        updateResult = await adultmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: adminApproved, status: status } }
        );
        await notificationmodel.updateOne(
          { talentId: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: adminApproved, status: status } }
        );
        await removeVerificationId(adultmodel, userId);
      } else {
        // If not found in adultmodel, check in kidsmodel
        const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
        if (kidUser) {
          userType = 'kids';
          userEmail = kidUser.parentEmail; // Assuming parentEmail field exists in kidsmodel
          updateResult = await kidsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
          );

          await notificationmodel.updateOne(
            { talentId: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: adminApproved, status: status } }
          );

          await removeVerificationId(kidsmodel, userId);
        }

      }
    } else {
      if (adultUser) {
        userType = 'adults';
        userEmail = adultUser.email; // Assuming email field exists in adultmodel
        updateResult = await adultmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
        );

        await notificationmodel.updateOne(
          { talentId: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproved: adminApproved, status: status } }
        );

      } else {
        // If not found in adultmodel, check in kidsmodel
        const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true, inActive: true });
        if (kidUser) {
          userType = 'kids';
          userEmail = kidUser.parentEmail; // Assuming parentEmail field exists in kidsmodel
          updateResult = await kidsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: req.body.adminApproved, status: req.body.status } }
          );

          await notificationmodel.updateOne(
            { talentId: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproved: adminApproved, status: status } }
          );


        }

      }

    }

    // If user type is still empty, user was not found in any model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // If we have an update result, we successfully updated the profile status
    if (updateResult) {
      console.log("updateResultfinal", updateResult)
      if (userEmail) {
        if (req.body.status === "Approved") {
          sendApprovalEmail(userEmail);
        }
        else {
          RejectedVerificationEmail(userEmail);
        }

      }
      return res.json({ status: true, msg: 'Approved successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to Approval' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

/*
*********TalentProfileapproval*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const RejectedProfileEmail = (userEmail) => {
  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Admin Rejected Notification',
    html: `
    <h1>Sorry!</h1>
    <p>Your profile has been rejected by the admin</p>
    <p>For further information contact us</p>
    <p>Best Regards,<br>Admin Team</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};


const sendProfileEmail = (userEmail) => {
  const mailOptions = {
    from: host,
    to: userEmail,
    subject: 'Subscription Plan Approval Notification',
    html: `
    <h1>Congratulations!</h1>
    <p>Your profile has been approved based on your subscription plan </p>
    <p>Thank you for being a part of our community.</p>
    <p>Best Regards,<br>Admin Team</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};
const profileApproval = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const { adminApproved, status, profileApprove } = req.body;

    let userType = '';
    let updateResult = null;
    let userEmail = '';

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true, inActive: true });
    if (adultUser) {
      userType = 'adults';
      userEmail = adultUser.email;
      updateResult = await adultmodel.updateOne(
        { _id: userId },
        { $set: { adminApproved, status, profileApprove } }
      );

      await notificationmodel.updateOne(
        { $or: [{ brandId: userId }, { talentId: userId }], notificationType: 'Talent Profile Approval' },
        { $set: { adminApproved, status, profileApprove } }
      );
    } else {
      // Check in kidsmodel if not found in adultmodel
      const kidUser = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true });
      if (kidUser) {
        userType = 'kids';
        userEmail = kidUser.parentEmail;
        updateResult = await kidsmodel.updateOne(
          { _id: userId },
          { $set: { adminApproved, status, profileApprove } }
        );

        await notificationmodel.updateOne(
          { $or: [{ brandId: userId }, { talentId: userId }], notificationType: 'Talent Profile Approval' },
          { $set: { adminApproved, status, profileApprove } }
        );
      } else {
        // Check in brandsmodel if not found in adultmodel or kidsmodel
        const brandUser = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (brandUser) {
          userType = 'brands';
          userEmail = brandUser.email;
          updateResult = await brandsmodel.updateOne(
            { _id: userId },
            { $set: { adminApproved, status, profileApprove } }
          );

          await notificationmodel.updateOne(
            { $or: [{ brandId: userId }, { talentId: userId }], notificationType: 'Talent Profile Approval' },
            { $set: { adminApproved, status, profileApprove } }
          );
        }
      }
    }

    // If user type is still empty, user was not found in any model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }
    
    // If we have an update result, we successfully updated the profile status
    if (updateResult) {
      console.log("updateResultfinal", updateResult);

      if (userEmail) {
        if (status === "Approved") {
          sendProfileEmail(userEmail);
        } else {
          RejectedProfileEmail(userEmail);
        }
      }

      return res.json({ status: true, msg: 'Approved successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to approve profile' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};
/*
*********bellCountForNotification*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const bellIconCount = async (req, res) => {
  try {
    // Define the types of notifications to look for
    const notificationTypes = ['Job Approval', 'Talent Profile Approval', 'Talent Verification Approval'];

    // Find unread notifications of the specified types
    const unreadNotifications = await notificationmodel.find({
      read: false,
      notificationType: { $in: notificationTypes }
    });

    // Count the number of unread notifications
    const unreadCount = unreadNotifications.length;

    // Schedule the task to run every minute
    cron.schedule('* * * * *', async () => {
      console.log('Running the bellIconCount function...');
      try {
        await bellIconCount(req, res);
      } catch (error) {
        console.error('Error running scheduled bellIconCount:', error);
      }
    });

    if (req.body.read === true) {
      // Update all unread notifications to mark them as read
      await notificationmodel.updateMany(
        {
          read: false,
          notificationType: { $in: notificationTypes }
        },
        { $set: { read: true } }
      );
    }

    // Send the unread count as a JSON response
    res.json({
      status: true,
      data: unreadCount,
      message: 'Success'
    });

    console.log(`Unread notifications counted: ${unreadCount}`);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(200).json({
      status: false,
      message: 'Error fetching notifications'
    });
  }
};

/*
*********bellCountForNotification*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const readNotification = async (req, res) => {
  try {
    // Define the types of notifications to look for
    const notificationTypes = ['Job Approval', 'Talent Profile Approval', 'Talent Verification Approval'];

    // Update all unread notifications to mark them as read
    await notificationmodel.updateMany(
      {
        read: false,
        notificationType: { $in: notificationTypes }
      },
      { $set: { read: true } }
    );
    res.json({
      status: true,
      message: 'Success'
    });
    console.log('Unread notifications marked as read.');
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(200).json({
      status: false,
      message: 'Error Occured'
    });
  }
};

/*
*********gift mail *****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const giftMail = async (req, res) => {
  try {
    const { fullName, giftSenderEmail, giftReceiversName,comment, giftReceiversEmail } = req.body;



    // Email to the giver
    const mailOptionsToGiver = {
      from: host,
      to: giftSenderEmail,
      subject: 'Gift Coupon Sent Successfully',

      html: `<p>Dear ${fullName},</p>
<p>You have successfully given a gift to ${giftReceiversName}.</p>
<p>Best regards,</p>
<p>Brands And Talent</p>`,
    };

    // Email to the receiver
    const mailOptionsToReceiver = {
      from: host,
      to: giftReceiversEmail,
      subject: 'Gift Coupon Received Successfully',
      html: `<p>Dear ${giftReceiversName},</p>
      <p>You have successfully received a gift coupon from ${fullName}.</p>
      <p>Best regards,</p>
      <p>Brands And Talent</p>
      <p><u><a href="https://brandsandtalent.com/">Click Here  </a></u> to visit our website.</p>,
      <p><i>${req.body.comment}</i></p>`
    
    };
    // Send emails
    await transporter.sendMail(mailOptionsToGiver);
    await transporter.sendMail(mailOptionsToReceiver);

    res.json({
      status: true,
      message: 'Emails sent successfully',
    });
    console.log('Gift emails sent successfully.');
  } catch (error) {
    console.error('Error sending gift emails:', error);
    res.status(500).json({
      status: false,
      message: 'Error occurred while sending emails',
    });
  }
};







 const payment = async (req, res) => {
  const { amount, currency, items, payment_option,firstname,lastname,email,phone } = req.body;

  // Generate a unique transaction ID (you may want to use a more robust method)
  const transactionId = Math.random();

  // Current timestamp for request time formatted as YYYYmmddHis
  const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

  // Replace with your actual merchant_id, tran_id, payment_option, and public_key
  const ABA_PAYWAY_API_URL = 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase';
  const MERCHANT_ID = 'ec427730';
  const API_KEY = '3e2a9f6db6e01271d36f0de2a2e50ca2066bd17b';

  // Define return and cancel URLs
  const returnUrl = 'https://yourapp.com/payment-success';
  const cancelUrl = 'https://yourapp.com/payment-failure';

  // Construct the message to be hashed
  const message = `${now}${MERCHANT_ID}${transactionId}${amount}${items}${currency}${payment_option}${returnUrl}${cancelUrl}${API_KEY}`;

  // Create a HMAC-SHA512 hash
  const hmac = crypto.createHmac('sha512', Buffer.from(API_KEY, 'utf-8'));
  hmac.update(message);
  const hash = hmac.digest('base64');

  try {
    // Prepare data for the POST request
    const requestData = {
      req_time: now,
      hash: hash,
      merchant_id: MERCHANT_ID,
      api_key: API_KEY,
      amount: amount,
      currency: currency,
      tran_id: transactionId,
      items: items,
      payment_option: payment_option,
      return_url: returnUrl,
      cancel_url: cancelUrl
    };

    // Make the POST request to initiate payment
    const response = await axios.post(ABA_PAYWAY_API_URL, requestData);

    

    //res.json({ formattedResponse });
    res.json({ data: 'https://checkout-sandbox.payway.com.kh/api' });

  } catch (error) {
    console.error('Payment initiation error:', error.response ? error.response.data : error.message);
    // Handle the error by sending an appropriate response
    res.status(error.response ? error.response.status : 500).json({ message: 'Payment initiation failed', error: error.message });
  }
};


//check transaction
const checkTransaction = async (req, res) => {
  const { transactionId, req_time } = req.body;

  const ABA_PAYWAY_API_URL = 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2';
  const MERCHANT_ID = 'ec427730';
  const API_KEY = '3e2a9f6db6e01271d36f0de2a2e50ca2066bd17b';

  // Construct the message to be hashed
  const message = `${req_time}+${MERCHANT_ID}+${transactionId}`;

  // Create a HMAC-SHA512 hash
  const hmac = crypto.createHmac('sha512', Buffer.from(API_KEY, 'utf-8'));
  hmac.update(message);

  // Get the hashed data and encode to base64
  const hash = hmac.digest('base64');

  try {
    const response = await axios.post(ABA_PAYWAY_API_URL, {
      req_time: req_time,
      hash: hash,
      merchant_id: MERCHANT_ID,
      tran_id: transactionId
    });

    console.log("Payment check response:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Payment initiation error:', error.message);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};



//Review Approval
const sendEmailUse = async (to, subject, text) => {
  const mailOptions = {
    from: host,
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

// Function to send email
const sendEmailToUser = async (to, subject, text) => {
  const mailOptions = {
    from: host,
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
};
const reviewApproval = async (req, res) => {
  try {
    const { talentId, reviewApproved, reviewerId,comment,text} = req.body;

    let userType = '';
    let updateResult = null;
  
      // Assuming comment is received from req.body or another source
      const trimmedComment = comment.trim();
    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: talentId, isActive: true });
    if (adultUser) {
      userType = 'adults';
      updateResult = await adultmodel.updateOne(
        { _id: talentId, "reviews.reviewerId": reviewerId,"reviews.comment": trimmedComment },
       
       { $set: { "reviews.$[elem].reviewApproved": reviewApproved ,isReport:true} },
       { arrayFilters: [{ "elem.reviewerId": { $in: reviewerId },"elem.comment":{$in:trimmedComment} }] }
      );
      
   

    await notificationmodel.updateOne(
      { talentId: talentId,reviewerId:reviewerId,notificationMessage:comment,  notificationType: 'Review Notification' },
      { $set: { reviewApproved: reviewApproved, status: reviewApproved,isReport:true } }
    );
   // Send email to adult
   const emailResponse = await sendEmailUse(adultUser.adultEmail, 'Review Approval Notification', text);
   console.log(emailResponse.message);
  
    } else {
      // Check in kidsmodel if not found in adultmodel
      const kidUser = await kidsmodel.findOne({ _id: talentId, isActive: true });
      if (kidUser) {
        userType = 'kids';
        updateResult = await kidsmodel.updateOne(
          { _id: talentId, "reviews.reviewerId": reviewerId,"reviews.comment": trimmedComment },
         // { $set: { "reviews.$.reviewApproved": reviewApproved } }
         { $set: { "reviews.$[elem].reviewApproved": reviewApproved,isReport:true } },
         { arrayFilters: [{ "elem.reviewerId": { $in: reviewerId },"elem.comment":{$in:trimmedComment} }] }
        );
        console.log("updateResult",updateResult)
       

        await notificationmodel.updateOne(
          { talentId: talentId,reviewerId:reviewerId,notificationMessage:comment, notificationType: 'Review Notification' },
          { $set: { reviewApproved: reviewApproved, status: reviewApproved,isReport:true } }
        );
        // Send email to parent
        const emailResponse = await sendEmailToUser(kidUser.parentEmail, 'Review Approval Notification', text);
        console.log(emailResponse.message);
      } 
   
    }

   
    // If user type is still empty, user was not found in any model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    console.log("updateResult", updateResult);

    // Check if update was successful
    if (updateResult && updateResult.modifiedCount > 0) {
      console.log("updateResultfinal", updateResult);


      return res.json({ status: true, msg: 'Approved successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to approve profile' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

const addSuccessStories = async (req, res) =>{
  console.log("inside add successstories")
  try{
    console.log('req.body',req.body)
    const {name, content, category, link, image} = req.body;
  const successData = new successStoryModel({
    name:name,
    content:content,
    category:category,
    link:link,
    image:image,
  });

  const response = await successData.save();
  console.log('response',response)
  if(response){
    res.json({
      message: "Added Successfully",
      status: true,
    });
  }
  }catch(err){
    res.json({
      message: "failed to add data",
      status: false,
    });
  }
}

const getSuccessStories = async (req, res) => {
  console.log("Fetching all success stories");
  try {
    const successStories = await successStoriesmodel.find(); // Fetch all documents from the collection
    console.log('successStories', successStories);
    res.json({
      message: "Fetched Successfully",
      status: true,
      data: successStories, // Send the fetched data in the response
    });
  } catch (err) {
    console.error('Error fetching success stories:', err);
    res.json({
      message: "Failed to fetch data",
      status: false,
      data: [],
    });
  }
};

/*
*********getLogos*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const getLogos = async (req, res) => {
  try {
    // Fetch content items based on contentType
    const logo = await logomodel.find({ isActive: true });

    if (!logo) {
      return res.status(200).json({
        message: "logo not found",
        status: false
      });
    }

    return res.json({
      message: "logo retrieved successfully",
      status: true,
      data: logo
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      status: false
    });
  }
};

/**
 *********addLogo******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



 const addLogo = async (req, res, next) => {
  try {
    console.log(req.body);

    // Assuming req.body.image is an array of image URLs
    const imagesWithId = req.body.image.map((imgUrl) => ({
      _id: new mongoose.Types.ObjectId(), // Generate a unique ID for each image
      url: imgUrl, // The image URL
    }));

    const add_Logo = new logomodel({
      image: imagesWithId, // Add the array of images with unique IDs
      isActive: true
    });

    const response = await add_Logo.save();

    return res.json({
      message: "Added Successfully",
      status: true,
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
    });
  }
};
/**
 *********addImageToLogo******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const addImageToLogo = async (req, res, next) => {
  try {
    const logoId = req.body.logoId; // Assuming the ID of the logo document is passed as a URL parameter

    // Create the new image object with a unique ID
    const newImage = {
      _id: new mongoose.Types.ObjectId(), // Generate a unique ID for the new image
      url: req.body.url, // The new image URL from the request body
    };

    // Find the document by ID and push the new image into the existing image array
    const updatedLogo = await logomodel.findByIdAndUpdate(
      logoId,
      { $push: { image: newImage } }, // Push the new image into the array
      { new: true } // Return the updated document
    );

    if (!updatedLogo) {
      return res.status(200).json({
        message: "Logo not found",
        status: false,
      });
    }

    return res.json({
      message: "Image added successfully",
      status: true,
      data: updatedLogo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      status: false,
    });
  }
};

/**
 *********deleteImageFromLogo******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteImageFromLogo = async (req, res, next) => {
  try {
    const logoId = req.body.logoId; // Assuming the ID of the logo document is passed as a URL parameter
    const imageId = req.body.imageId; // Assuming the ID of the image to delete is passed as a URL parameter

    // Find the document by ID and remove the specific image from the image array
    const updatedLogo = await logomodel.findByIdAndUpdate(
      logoId,
      { $pull: { image: { _id: imageId } } }, // Pull the image with the specified _id from the array
      { new: true } // Return the updated document
    );

    if (!updatedLogo) {
      return res.status(200).json({
        message: "Logo not found",
        status: false,
      });
    }

    return res.json({
      message: "Image deleted successfully",
      status: true,
      data: updatedLogo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      status: false,
    });
  }
};


module.exports = {
  addAdmin, adminLogin, adminProfile, forgotPassword, resetPassword, fileUpload, uploads, addCountry, listState, adminFetch, listLocation, listCountries,
  listCity, getAllStatesList, getAllCitiesList, chatbot, adminApproval, jobApproval, notApprovedMembers, ListBrandForJobPost,
  filterByStatus, jobApprovalByBrandsList, adminApprovalByList, profileApproval, bellIconCount, readNotification, giftMail,
 checkTransaction,payment,reviewApproval,addSuccessStories,getLogos,addLogo,getSuccessStories,addImageToLogo,deleteImageFromLogo

};