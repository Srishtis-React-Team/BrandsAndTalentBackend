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


const { Country, State, City } = require('country-state-city');
const kidsmodel = require("../../users/models/kidsmodel.js");

const listCity = async (req, res, next) => {
  try {
    const { countryName, stateName } = req.body;

    // First, find the ISO code for the country
    const countryISO = Country.getAllCountries().find(country => country.name === countryName)?.isoCode;

    if (!countryISO) {
      return res.status(404).json({ status: false, message: 'Country not found' });
    }

    // Then, find the ISO code for the state within that country
    const stateISO = State.getStatesOfCountry(countryISO).find(state => state.name === stateName)?.isoCode;

    if (!stateISO) {
      return res.status(404).json({ status: false, message: 'State not found' });
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






// 26/3 correct full code



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


function formatResponse(botResponse, userMsg) {
  return {
      time: getCurrentTimeInCambodia(),
      botResponse: botResponse,
      userMsg: userMsg
  };
}





//27/3
//  let interactionStep = 0; // This should ideally be managed on a per-user basis

// const chatbot = async (req, res) => {
//   const { message, user_id } = req.body;
//   let botResponse;
//   let userMsg = message; // Directly use message from req.body

//   switch (interactionStep) {
//     case 0:
//       botResponse = "Hi! Welcome to Brands & Talents. What is your name?";
//       interactionStep = 1;
//       break;
//     case 1:
//       botResponse = `Nice to meet you, ${message}. Are you a brand or talent?`;
//       interactionStep = 2;
//       break;
//     case 2:
//       if (message.toLowerCase() === 'brand') {
//         botResponse = "How can I assist you as a brand?";
//         interactionStep = 4; // Assuming this leads to a satisfaction question or similar
//       } else if (message.toLowerCase() === 'talent') {
//         botResponse = "How old are you?";
//         interactionStep = 3;
//       } else {
//         botResponse = "I'm sorry, I didn't understand. Are you a brand or talent?";
//       }
//       break;
//     case 3:
//       // Handling age for talent
//       const userAge = parseInt(message);
//       if (isNaN(userAge)) {
//         botResponse = "Please enter a valid age in numbers.";
//         // Keep the same interactionStep to allow the user to try again
//       } else {
//         // Assuming a successful age parse; proceed with user-specific logic
//         try {
//           let userModel = userAge < 18 ? kidsmodel : adultmodel;
//           const user = await userModel.findById(user_id).exec();

//           if (user && user.email) {
//             botResponse = `We found your email: ${user.email}. How can we assist you further?`;
//           } else {
//             botResponse = userAge < 18 ? chatKidsTemplate() : chatAdultTemplate();
//           }
//           interactionStep = 4; // Proceed to next step after handling
//         } catch (error) {
//           console.error("Error while finding user or processing age:", error);
//           botResponse = "Sorry, an error occurred. Please try again.";
//           // Optionally, decide if you want to increment interactionStep here
//         }
//       }
//       break;
//     case 4:
//       // Generic help or satisfaction check, depending on previous steps
//       botResponse = "Are you satisfied with this section yes/no?";
//       interactionStep = 5;
//       break;
//     case 5:
//       if (message.toLowerCase() === "yes") {
//         botResponse = "Thank you for chatting with us. Have a great day!";
//       } else {
//         botResponse = "For further assistance, please contact brandstalent123@gmail.com.";
//       }
//       interactionStep = 0; // Reset for a new conversation
//       break;
//     default:
//       botResponse = "I'm not sure how to respond to that. Can you try asking something else?";
//       break;
//   }

//   // Assuming formatResponse is a function you've defined to format the bot's response
//   res.json({ message: formatResponse(botResponse, userMsg) });
// };

///
let userName = ''; // To store the user's name
let userAge = 0; // To store the user's age

let interactionStep = 0; // This should ideally be managed on a per-user basis

// const chatbot = async (req, res) => {
//   const { message, user_id } = req.body; // Assuming the client sends a user_id
//   let botResponse;
//   let userMsg = message; // Directly use message from req.body

//   switch (interactionStep) {
//     case 0:
//       botResponse = "Hi! Welcome to Brands & Talents. ";
//       interactionStep++;
//       break;
//     case 1:
//       botResponse = "What is your name? ";
//       interactionStep++;
//       break;
//     case 2:
//       // Assuming userName is declared somewhere or should be saved per user session
//       botResponse = `${message}, How old are you ?  `;
//       interactionStep++;
//       break;
//     case 3:
//       botResponse = `Are you brands or talent?  `;
//       interactionStep++;
//       break;
//     case 4:
//       const type = message.toLowerCase(); // Store the user's input and convert to lowercase

//       if (type === 'brands') {
//         botResponse = "Can you try asking something else? For more help, contact us at brandstalent123@gmail.com.";
//       } else if(type === 'talent'){
//         try {
//           const userAge = parseInt(message); // Store the user's age
//           if (isNaN(userAge)) {
//             botResponse = "I couldn't understand that. Can you please tell me how old you are in numbers?";
//           } else {
//             let userModel = userAge < 18 ? kidsmodel : adultmodel;
//             const user = await userModel.findById(user_id).exec();

//             if (user && user.email) {
//               botResponse = `We found your email: ${user.email}. How can we assist you further?`;
//             } else {
//               botResponse = userAge < 18 ? chatKidsTemplate() : chatAdultTemplate();
//             }
//             interactionStep++; // Move to the next step
//           }
//         } catch (error) {
//           console.error("Error while finding user or processing age:", error);
//           botResponse = "Sorry, an error occurred. Please try again.";
//           // Decide if you want to increment interactionStep here based on your application's needs
//         }
//       }
//       break;
//     case 5:
//       botResponse = "Are you satisfied with this section yes/no?";
//       interactionStep++;
//       break;
//     case 6:
//       botResponse = message.toLowerCase() === "yes" ? "Thank you for chatting with us. Have a great day! " : "For further assistance, contact brandstalent123@gmail.com.";
//       interactionStep = 0; // Reset for a new conversation
//       break;
//     default:
//       botResponse = "I'm not sure how to respond to that. Can you try asking something else? For more help, contact us at brandstalent123@gmail.com.";
//       break;
//   }

//   res.json({ message: formatResponse(botResponse, userMsg) });
// };


//28/3
let sessions = {}; // Simulated session storage

const chatbot = async (req, res) => {
  const { message, sessionId } = req.body; // Assuming the client sends a sessionId
  let botResponse;
     let userMsg = req.body.message;
     console.log("req.body",req.body)

  // Initialize or retrieve the session
  if (!sessions[sessionId]) {
    sessions[sessionId] = { interactionStep: 0 }; // New session
  }
  let interactionStep = sessions[sessionId].interactionStep;

  switch (interactionStep) {
    case 0:
      botResponse = "Hi! Welcome to Brands & Talents.";
      interactionStep++;
      break;
          case 1:
      botResponse = "What is your name? ";
      interactionStep++;
      break;
    case 2:
      userName = message; // Store the user's name
      botResponse = `Are you brands or talent?  `;
      interactionStep++;
      break;
    case 3:
      type = message.toLowerCase();
      if (type === 'brands') {
        botResponse = `For brands sign up, go to this link: https://hybrid.sicsglobal.com/project/brandsandtalent/signup`;
      } else if (type === 'talent') {
        botResponse = `${userName}, how old are you?  `;
      } else {
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

  res.json({ message: formatResponse(botResponse, userMsg) });
};
// const chatbot = async (req, res) => {
//   let botResponse;
//   const { message } = req.body; // Assuming the client sends a message
//   let userMsg = req.body.message;
  
//   switch (interactionStep) {
//     case 0:
//       botResponse = "Hi! Welcome to Brands & Talents. ";
//       interactionStep++;
//       break;
//     case 1:
//       botResponse = "What is your name? ";
//       interactionStep++;
//       break;
//     case 2:
//       userName = message; // Store the user's name
//       botResponse = `Are you brands or talent?  `;
//       interactionStep++;
//       break;
//     case 3:
//       type = message.toLowerCase();
//       if (type === 'brands') {
//         botResponse = `For brands sign up, go to this link: https://hybrid.sicsglobal.com/project/brandsandtalent/signup`;
//       } else if (type === 'talent') {
//         botResponse = `${userName}, how old are you?  `;
//       } else {
//         botResponse = "For further assistance, contact brandstalent123@gmail.com.";
//       }
//       interactionStep++;
//       break;
//     case 4:
//       userAge = parseInt(message); // Store the user's age
//       if (isNaN(userAge)) {
//         botResponse = "I couldn't understand that. Can you please tell me how old you are in numbers? ";
//       } else {
//         if (userAge < 18) {
//           // Use the chatKidsTemplate function here to generate the response for kids
//           botResponse = chatKidsTemplate();
//         } else {
//           // Use the chatAdultTemplate function here to generate the response for adults
//           botResponse = chatAdultTemplate();
//         }
//         interactionStep++; // Move to the next step
//       }
//       break;
//     case 5:
//       // Handle user's request or question here. For simplicity, we move to satisfaction check.
//       botResponse = "Are you satisfied with this section yes/no?";
//       interactionStep++;
//       break;
//     case 6:
//       if (message.toLowerCase() === "yes") {
//         botResponse = "Thank you for chatting with us. Have a great day! ";
//       } else {
//         botResponse = "For further assistance, contact brandstalent123@gmail.com.";
//       }
//       interactionStep = 0; // Reset for a new conversation
//       break;
//     default:
//       botResponse = "I'm not sure how to respond to that. Can you try asking something else? For more help, contact us at brandstalent123@gmail.com.";
//       break;
//   }
  
//   res.json({ message: formatResponse(botResponse, userMsg) });
// };



//correct code
// const chatbot = async (req, res) => {
//   let botResponse;
//   const { message } = req.body; // Assuming the client sends a message
//   let userMsg = req.body.message;
// switch (interactionStep) {
//   case 0:
//       botResponse = "Hi! Welcome to Brands & Talents. "
//       console.log(formatResponse(botResponse, userMsg));
//       interactionStep++;
//       break;
//       case 1:
//         botResponse = "What is your name? " 
//         interactionStep++;
//         break;
//     case 2:
//         userName = message; // Store the user's name
//         botResponse = `Are you brands or talent?  ` 
//         interactionStep++;
//         break;

//         case 3:
//           botResponse = `${userName}, how old are you?  `
//           interactionStep++;
//           break;
//     case 4:
//         userAge = parseInt(message); // Store the user's age
//         if (isNaN(userAge)) {
//             botResponse = "I couldn't understand that. Can you please tell me how old you are in numbers? "
//         } else {
//             if (userAge < 18) {
//                 // Use the chatKidsTemplate function here to generate the response for kids
//                 botResponse = chatKidsTemplate() 
//             } else {
//                 // Use the chatAdultTemplate function here to generate the response for adults
//                 botResponse = chatAdultTemplate() 
//             }
//             interactionStep++; // Move to the next step
//         }
//         break;
//     case 5:
//         // Handle user's request or question here. For simplicity, we move to satisfaction check.
//         botResponse = "Are you satisfied with this section yes/no?"
//         interactionStep++;
//         break;
//     case 6:
//         if (message.toLowerCase() === "yes") {
//             botResponse = "Thank you for chatting with us. Have a great day! "
//         } else {
//             botResponse = "For further assistance, contact brandstalent123@gmail.com."
//         }
//         interactionStep = 0; // Reset for a new conversation
//         break;
//     default:
//         botResponse = "I'm not sure how to respond to that. Can you try asking something else? For more help, contact us at brandstalent123@gmail.com."
//         break;
// }
// res.json({ message:formatResponse(botResponse, userMsg) });


// };


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

module.exports = {
  addAdmin, adminLogin, adminProfile, forgotPassword, resetPassword, fileUpload, uploads, addCountry, listState, adminFetch, listLocation, listCountries,
  listCity,getAllStatesList,getAllCitiesList,chatbot


};