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
const { getBusinessReviewEmailTemplate } = require('../../template.js');
const nodemailer = require('nodemailer');


const generateAndHashOTP = async () => {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP
  const hashedOTP = await bcrypt.hash(otp.toString(), 10); // Hash the OTP
  return { otp, hashedOTP };
};

// Send OTP through email
const sendOTPByEmail = async (email, otp) => {
  const mailOptions = {
    from: host,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP (One-Time Password) is ${otp}. Please use this code to complete your verification process. Do not share this code with anyone. Thank you for using our services.\n\nKind regards,\nTeam`
  };

  try {
    await transporter.sendMail(mailOptions);
    return true; // Return true if email sent successfully
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false; // Return false if email sending fails
  }
};


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});

const brandsmodel = require('../models/brandsmodel.js');
const kidsmodel = require("../../users/models/kidsmodel.js");
const adultmodel = require("../../users/models/adultmodel.js");

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const brandsRegister = async (req, res, next) => {
  try {
    console.log(req.body);

    // It's good practice to validate confirmPassword here before proceeding.
    if (req.body.brandPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        status: false
      });
    }

    const hashedPass = await bcrypt.hash(req.body.brandPassword, 10);
    console.log("hashedPass", hashedPass);

    const userExist = await brandsmodel.findOne({ brandEmail: req.body.brandEmail });

    if (userExist) {
      console.log("Email already exists");
      return res.status(400).json({
        message: "Email ID already exists",
        status: false
      });
    }

    const newBrandData = {
      position:req.body.position,
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPassword: hashedPass,
      confirmPassword: hashedPass,
      isActive: true,
      userType: 'brand',
      isVerified: false
    };

    const newBrand = new brandsmodel(newBrandData);
    const savedBrand = await newBrand.save();

    const { otp, hashedOTP } = await generateAndHashOTP();

    // Assuming you have a mechanism to send the OTP via email
    const emailSent = await sendOTPByEmail(savedBrand.brandEmail, otp);
    if (!emailSent) {
      return res.status(500).json({ status: false, message: 'Error sending OTP' });
    }

    // Update the brand with the hashed OTP for further verification
    await brandsmodel.findByIdAndUpdate(savedBrand._id, { otp: hashedOTP });

    return res.status(200).json({
      status: true,
      message: 'An e-mail has been sent to ' + req.body.brandEmail + ' with further instructions.',
      data: req.body.brandEmail
    });

  } catch (error) {
    console.error("Error during brand registration:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred during registration."
    });
  }
};
/**
*********brands Otp verification******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const otpVerificationBrands = async (req, res, next) => {
  try {
    const { otp: inputOTP, brandEmail: email } = req.body;

    // Fetch the user from the database for the given email
    const user = await brandsmodel.findOne({ brandEmail: email, isActive: true });
    if (!user) {
      console.log("Error: User not found for email", email); // Log for debugging; be cautious about logging sensitive information
      return res.status(404).json({
        message: "User not found",
        status: false
      });
    }

    // Retrieve the hashed OTP from the user document
    const hashedOTP = user.otp;

    // Compare the input OTP with the hashed OTP
    const isMatch = await bcrypt.compare(inputOTP.toString(), hashedOTP);
    if (isMatch) {
      // Update isVerified value to true for the user with the given email
      // And update the brand details if provided
      const updateData = { isVerified: true };

      // Check and add brand details to updateData if they are provided in the request
      // Assuming 'brandDetails' is a nested object in the request body containing brand-specific information to be updated
      if (req.body.brandDetails) {
        // Directly adding brandDetails might overwrite the entire document's structure under 'brandDetails' field
        // Ensure this operation is intended and aligns with your data model
        updateData.brandDetails = req.body.brandDetails;
      }
     

      await brandsmodel.findOneAndUpdate({ brandEmail: email }, { $set: updateData }, { new: true });

      res.json({
        message: "User verified",
        status: true,
        data: { brandEmail: email ,brandUserId:user._id} // for consistency, wrap email in an object
      });
    } else {
      console.log("Error: OTP does not match for email", email); // Log for debugging
      res.status(400).json({
        message: "OTP does not match",
        status: false
      });
    }
  } catch (error) {
    console.error("Error in otpVerificationBrands:", error); // More descriptive error logging
    res.status(500).json({
      message: "An error occurred",
      status: false,
      error: error.toString()
    });
  }
};

// const otpVerificationBrands = async (req, res, next) => {
//   try {
//     const { otp: inputOTP, brandEmail: email } = req.body;

//     // Fetch the user from the database for the given email
//     const user = await brandsmodel.findOne({ brandEmail: email, isActive: true });
//     console.log("user", user);
//     if (!user) {
//       console.log("Error: User not found");
//       return res.status(404).json({
//         message: "User not found",
//         status: false
//       });
//     }

//     // Retrieve the hashed OTP from the user document
//     const hashedOTP = user.otp;

//     // Compare the input OTP with the hashed OTP
//     const isMatch = await bcrypt.compare(inputOTP.toString(), hashedOTP);

//     if (isMatch) {
//       // Update isVerified value to true for the user with the given email
//       // And update the brand details if provided
//       const updateData = { isVerified: true };

//       // Optional: Add brand details to updateData if they are provided in the request
   

//       await brandsmodel.findOneAndUpdate({ brandEmail: email }, updateData, { new: true });

//       console.log("Success: User verified");
//       res.json({
//         message: "User verified",
//         status: true,
//         data: req.body.brandEmail
//       });
//     } else {
//       console.log("Error: OTP does not match");
//       res.status(400).json({
//         message: "OTP does not match",
//         status: false
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       message: "An error occurred",
//       status: false,
//       error: error.toString()
//     });
//   }
// };

/**
*********Brands Login******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const brandsLogin = async (req, res, next) => {
  const username = req.body.brandEmail;
  const password = req.body.brandPassword;


  try {
    const brands = await brandsmodel.findOne({ $or: [{ brandEmail: username }, { brandEmail: username }], isActive: true });
    console.log("brands", brands)
    if (brands) {
      const passwordMatch = await bcrypt.compare(password, brands.brandPassword);

      if (passwordMatch) {
        const token = auth.gettoken(brands._id, brands.brandEmail);

        return res.json({
          status: true,
          message: 'Login Successfully',
          data: brands,
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
/**
*********Brands Login******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

/**
 *********editBrands*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


const editBrands = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    // /* Authentication */

    const user_id = req.body.user_id || req.params.user_id;
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPhone: req.body.brandPhone,
      brandZipCode: req.body.brandZipCode,
      howHearAboutAs: req.body.howHearAboutAs,
      logo: req.body.logo,
      address: req.body.address,

    };

    try {
      await brandsmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(user_id) },
        { $set: updateFields }
      );
      res.json({ status: true, msg: 'Updated successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'Error Occurred' });
  }
};
/**
 *********deleteBrands*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteBrands = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    try {
      const user_id = req.body.user_id || req.params.user_id;
      await brandsmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(user_id) },
        { $set: { isActive: false } }
      );
      res.json({ status: true, msg: 'Deleted successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'Invalid Token' });
  }
};
/********** brandsProfile******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const getBrandById = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */

    const user = await brandsmodel.findOne({ _id: userId, isActive: true });
    if (user) {
      return res.json({ status: true, data: user });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Invalid Token' });
  }
};
/********** recentGigs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const topBrands = async (req, res, next) => {
  try {
    const response = await brandsmodel.find({ isActive: true }).select({ brandImage: 1, brandName: 1 });
    res.json({
      status: true,
      data: response
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Error fetching top brands"
    });
  }
};

/********** favourites List******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const favouritesList = async (req, res) => {
  try {
   // const userId = req.body.user_id || req.params.user_id;
     /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */


    // Fetch favorites from kidsmodel
    const kidsFavorites = await kidsmodel.find({ isActive: true, isFavorite: true });
    // Fetch favorites from adultmodel
    const adultFavorites = await adultmodel.find({ isActive: true, isFavorite: true });

    // Optionally, you might want to structure the response to distinguish between the two
    const data = {
      kidsFavorites,
      adultFavorites
    };

    res.json({
      status: true,
      data
    });
  } catch (error) {
    console.error(error); // It's good practice to log the error for debugging.
    res.status(500).json({
      status: false,
      message: "Error fetching favorites"
    });
  }
};
/********** searchData******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const searchData = [
  { id: 1, name: "Apple", description: "A fruit that grows on trees." },
  { id: 2, name: "Banana", description: "A curved fruit that grows in clusters on banana trees." },
  { id: 3, name: "Orange", description: "A citrus fruit that is round and orange in color." },
  // Add more items as needed
];
const searchDatas = async (req, res) => {
  const query = req.body.query.toLowerCase(); // Convert query to lowercase for case-insensitive search

  // Perform search logic
  const searchResults = searchData.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );

  res.json({ results: searchResults });

}
// const axios = require('axios');
// const cheerio = require('cheerio');

// const searchUrl = 'https://example.com'; // Replace with the URL you want to search
// const searchTerm = 'test'; // Replace with the term you want to search for

// async function fetchWebpage(url) {
//   try {
//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching the webpage: ${error}`);
//     return null;
//   }
// }

// function searchForTerm(html, term) {
//   const $ = cheerio.load(html);
//   const bodyText = $('body').text();

//   // Simple search - case sensitive and matches exact occurrences
//   const regex = new RegExp(term, 'g');
//   const matches = bodyText.match(regex);

//   if (matches) {
//     console.log(`Found ${matches.length} occurrences of the term "${term}":`);
//     console.log(matches);
//   } else {
//     console.log(`No occurrences of the term "${term}" found.`);
//   }
// }

// async function main() {
//   const html = await fetchWebpage(searchUrl);
//   if (html) {
//     searchForTerm(html, searchTerm);
//   }
// }

// main();

const socailSignUpBrands = async (req, res, next) => {
  try {
    console.log(req.body);


    const userExist = await brandsmodel.findOne({ brandEmail: req.body.brandEmail });

    if (userExist) {
      console.log("Email already exists");
      return res.status(400).json({
        message: "Email ID already exists",
        status: false
      });
    }

    const newBrandData = {
      brandEmail: req.body.brandEmail,
      googleId: req.body.googleId,
      provider: req.body.provider,
      isVerified: false,
      userType: 'brand',
      isActive: true,
      isFavorite: false,
      profileStatus: false,
      facebookId:req.body.facebookId


 
    };

    const newBrand = new brandsmodel(newBrandData);
    const savedBrand = await newBrand.save();

    
    return res.status(200).json({
      message: "Save successfully",
      status: true,
      email: req.body.brandEmail,
      user_id:newBrand._id
      
    });

  } catch (error) {
    console.error("Error during brand registration:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred during registration."
    });
  }
};
/**
********editPassword******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const updateBrandPassword = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    // Assuming auth.CheckAuth is an async function you've defined for authentication
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }

    const hashedPass = await bcrypt.hash(req.body.brandPassword, 10);

    const updateResult = await brandsmodel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { isActive: true, brandPassword: hashedPass } }
    );

    const email = req.body.brandEmail;

    // Generate and hash new OTP
    const { otp, hashedOTP } = await generateAndHashOTP();

    // Compose email options
    const mailOptions = {
      from: host,
      to: email,
      subject: "Use this code to verify your account",
      text: `Your One-Time Password (OTP) is ${otp}. Please use this code to complete your verification process. Do not share this code with anyone. Thank you for using our services.\n \nKind regards,\nTeam`,
    };

    // Send email with OTP
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error sending OTP",
          status: false,
          error: error
        });
      } else {
        console.log("Email sent: " + info.response);

        // Update the OTP in the database for the user
        try {
          await adultmodel.updateOne({ brandEmail: email }, { otp: hashedOTP });
          console.log("OTP updated successfully in the database");
        } catch (updateError) {
          console.error("Error updating OTP in the database:", updateError);
        }

        if (updateResult.modifiedCount === 0) {
          return res.json({ status: false, msg: 'No changes made. User not found or data is the same.' });
        }

        res.json({
          message: "OTP sent successfully and updated in the database",
          status: true
        });
      }
    });
  } catch (error) {
    res.json({ status: false, msg: 'Error Occurred: ' + error.message });
  }
};

module.exports = {
  brandsRegister, otpVerificationBrands, brandsLogin, editBrands, deleteBrands, getBrandById, topBrands,
  favouritesList,searchDatas,socailSignUpBrands,updateBrandPassword

};