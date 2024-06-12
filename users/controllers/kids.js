const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth.js');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
var loginData = require('../../emailCredentials.js');
const { gmail: { host, pass } } = loginData;
const { getBusinessReviewEmailTemplate } = require('../../template.js');
const { v4: uuidv4 } = require('uuid');




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


const nodemailer = require('nodemailer');




var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});

const kidsmodel = require('../models/kidsmodel.js');
const adultmodel = require('../models/adultmodel.js');
const { brandsRegister } = require("../../brands/controllers/brands.js");
const brandsmodel = require("../../brands/models/brandsmodel.js");
const applymodel = require("../../brands/models/applymodel.js");

/**
 ********* signUp*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const kidsSignUp = async (req, res, next) => {
  try {
    console.log(req.body);

    const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);

    console.log("hashedPass", hashedPass);

   // const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true });
    // Check if the email already exists in any model
    const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true,inActive:true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.parentEmail, isActive: true,inActive:true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.parentEmail, isActive: true,inActive:true}).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found
    
    if (userExists) {
      console.log("Email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }
    

    // if (userExist) {
    //   console.log("email matches");
    //   return res.json({
    //     message: "Email ID Already Exists",
    //     status: false
    //   });
    // }

    // Generate and hash OTP
    const { otp, hashedOTP } = await generateAndHashOTP();

    // Send OTP after saving user
    const email = req.body.parentEmail;
    const emailSent = await sendOTPByEmail(email, otp);

    if (emailSent) {
      // Create a new user document
      const newUser = new kidsmodel({
        parentFirstName: req.body.parentFirstName,
        parentLastName: req.body.parentLastName,
        parentEmail: req.body.parentEmail,
        parentMobileNo: req.body.parentMobileNo,
        parentCountry: req.body.parentCountry,
        parentState: req.body.parentState,
        parentAddress: req.body.parentAddress,
        talentPassword: hashedPass,
        confirmPassword:hashedPass, //req.body.confirmPassword,
        profession: req.body.profession,
        relevantCategories: req.body.relevantCategories,
        childFirstName: req.body.childFirstName,
        childLastName: req.body.childLastName,
        preferredChildFirstname: req.body.preferredChildFirstname,
        preferredChildLastName: req.body.preferredChildLastName,
        childGender: req.body.childGender,
        childNationality: req.body.childNationality,
        childEthnicity: req.body.childEthnicity,
        languages: req.body.languages,
        childDob: req.body.childDob,
        childPhone: req.body.childPhone,
        childEmail: req.body.childEmail,
        childLocation: req.body.childLocation,
        childCity: req.body.childCity,
        childAboutYou: req.body.childAboutYou,
        userType: 'talent',
        isVerified: false,
        type: 'kids',
        isActive: true,
        otp: hashedOTP, // Store hashed OTP in the user document
        bodyType: req.body.bodyType,
        industry: req.body.industry,
        isFavorite: false,
        bookJob: "25",
        rating: "4",
        profileStatus: true,
        age:req.body.age,
        inActive:true,
        fcmToken:req.body.fcmToken,
        admin_Approved:false
      });

      // Save the new user to the database
      await newUser.save();

      res.json({
        message: "Half Registered Successfully",
        status: true,
        data: req.body.parentEmail
      });
    } else {
      res.json({
        message: "Error sending OTP",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
      error: error
    });
  }
};


/**
*********adultSignUp******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const adultSignUp = async (req, res, next) => {
  try {
    console.log(req.body);

    // Hash the password
    const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);
    console.log("hashedPass", hashedPass);

    // Check if the user already exists
     // Check if the email already exists in any model
     const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.adultEmail, isActive: true,inActive:true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true,inActive:true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.adultEmail, isActive: true,inActive:true }).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found
    
    if (userExists) {
      console.log("Email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }
    // const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true });
    // if (userExist) {
    //   console.log("email matches");
    //   return res.json({
    //     message: "Email ID Already Exists",
    //     status: false
    //   });
    // }

    // Generate OTP and hash it
    const { otp, hashedOTP } = await generateAndHashOTP();

    // Send OTP after saving user
    const email = req.body.adultEmail;
    const emailSent = await sendOTPByEmail(email, otp);

    if (emailSent) {
      // Create a new user document
      const newUser = new adultmodel({
        adultEmail: req.body.adultEmail,
        talentPassword: hashedPass,
        confirmPassword: hashedPass,//req.body.confirmPassword,
        isVerified: false,
        userType: 'talent',
        isActive: true,
        type: 'adults', // Assuming type should be set to 'adult'
        otp: hashedOTP,// Store hashed OTP in the user document
        isFavorite: false,
        bookJob: '30',
        rating: '3',
        profileStatus: false,
        inActive:false,
        image:req.body.image,
        fcmToken:req.body.fcmToken,
        maritalStatus:req.body.maritalStatus,
        parentState:req.body.parentState,
        parentAddress:req.body.parentAddress,
        parentCountry:req.body.parentCountry,
        childPhone:req.body.childPhone

      });

      // Save the new user to the database
      const response = await newUser.save();
      res.json({
        message: "OTP sent successfully",
        status: true,
        data: req.body.adultEmail, // Ensure this property exists in the request body
        id: newUser._id, // Renamed to 'userId' for clarity
    });
     
    } else {
      res.json({
        message: "Error sending OTP",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
      error: error
    });
  }
};

/**
*********adult otpVerification******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const otpVerificationAdult = async (req, res, next) => {
  try {
    const inputOTP = req.body.otp;
    const newEmail = req.body.adultEmail;

    // Fetch the user from the database for the given email
    const user = await adultmodel.findOne({ adultEmail: newEmail, isActive: true });
    console.log("user", user)
    console.log("otp",req.body.otp)
    if (!user) {
      console.log("Error: User not found");
      return res.json({
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
      await adultmodel.findOneAndUpdate({ adultEmail: newEmail }, { isVerified: true });

      console.log("Success: User verified");
      const userId = user._id; // Assuming _id is the user ID
      // Send a welcome email to the verified user
      const mailOptions = {
        from: host,
        to: newEmail,
        subject: 'Welcome to Brands&Talent',
        html: getBusinessReviewEmailTemplate(userId.toString())// getBusinessReviewEmailTemplate() // Assuming you have the email template function
      };

      await transporter.sendMail(mailOptions);

      console.log("Success: User verified and email sent");
      res.json({
        message: "User verified",
        status: true,
        data:user._id
      });
    } else {
      console.log("Error: OTP does not match");
      res.json({
        message: "OTP does not match",
        status: false
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({
      message: "An error occurred",
      status: false,
      error: error
    });
  }
};


/**
*********otpVerification******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const otpVerification = async (req, res, next) => {
  try {
    const inputOTP = req.body.otp;
    const newEmail = req.body.parentEmail;

    // Fetch the user from the database for the given email
    const user = await kidsmodel.findOne({ parentEmail: newEmail, isActive: true,inActive:true });
    if (!user) {
      console.log("Error: User not found");
      return res.json({
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
      await kidsmodel.findOneAndUpdate({ parentEmail: newEmail }, { isVerified: true });


      console.log("Success: User verified");
      res.json({
        message: "User verified",
        status: true,
        data: {
          parentEmail: req.body.parentEmail,
          userId: user._id // Assuming 'user' is a variable holding the user's data
        }
      });

    } else {
      console.log("Error: OTP does not match");
      res.json({
        message: "OTP does not match",
        status: false
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({
      message: "An error occurred",
      status: false,
      error: error
    });
  }
};


/**
*********subscription******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const subscriptionPlan = async (req, res, next) => {
  try {
    const { user_id, subscriptionPlan, planName } = req.body;

    // Check if the user is a kid, adult, or brand based on the provided user_id
    const isKid = req.body.hasOwnProperty('user_id');
    const isBrand = req.body.hasOwnProperty('brand_id');

    // Define the model based on the user type (kid, adult, or brand)
    let UserModel;
    if (isKid) {
      UserModel = kidsmodel;
    } else if (isBrand) {
      UserModel = brandsmodel;
    } else {
      UserModel = adultmodel;
    }

    // Update subscription plan for the user with the given user_id
    const query = isKid
      ? { isActive: true, _id: user_id, inActive: true }
      : isBrand
      ? { _id: user_id } // Update query for brand model
      : { _id: user_id }; // Update query for adult model

    const updatedUser = await UserModel.findOneAndUpdate(
      query,
      { subscriptionPlan, planName },
      { new: true } // To return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Success: Subscription plan updated");
    res.json({
      message: "Subscription plan updated",
      status: true,
      data: updatedUser._id // Return the updated user's ID
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred",
      status: false,
      error: error.message
    });
  }
};


// const subscriptionPlan = async (req, res, next) => {
//   try {
//     const newEmail = req.body.parentEmail;

//     // Update subscription plan for the user with the given email

//     const userId = req.body.user_id || req.params.user_id;
//     const updatedUser = await kidsmodel.findOneAndUpdate(
//       { parentEmail: newEmail, isActive: true, _id: userId,inActive:true},
//       { subscriptionPlan: req.body.subscriptionPlan,planName:req.body.planName },
//       { new: true } // To return the updated document
//     );

//     console.log("Success: Subscription plan updated");
//     res.json({
//       message: "Subscription plan updated",
//       status: true,
//       data: updatedUser._id // Return the updated user's ID
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.json({
//       message: "An error occurred",
//       status: false,
//       error: error
//     });
//   }
// };


/**
*********userLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const talentLogin = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  try {
    let user, type, model;

    // Attempt to find the user in the adultmodel
    user = await adultmodel.findOne({ adultEmail: email, isActive: true });
    type = 'adult';
    model = adultmodel; // Assign the model to update the fcmToken later

    if (!user) {
      // If not found in adultmodel, try finding in kidsmodel
      user = await kidsmodel.findOne({ parentEmail: email, isActive: true});
      type = 'kids';
      model = kidsmodel; // Update the model if user is a kid
    }

    // If user is still not found, return an error
    if (!user) {
      return res.json({
        status: false,
        message: 'User not found'
      });
    }

    // Check if the provided password matches for both adult and kids accounts
    const isMatch = await bcrypt.compare(password, user.talentPassword);
    if (!isMatch) {
      return res.json({
        status: false,
        message: 'Password does not match'
      });
    }

    // Update the fcmToken for the found user
    if (fcmToken) {
      await model.updateOne({ _id: user._id }, { $set: { fcmToken: fcmToken } });
    }

    // Generate a token assuming auth.gettoken is a function to do so
    const token = auth.gettoken(user._id, email, type);

    // Return success response
    return res.json({
      status: true,
      message: type === 'adult' ? 'Login successful' : 'Login successful (Kids account)',
      type: type,
      data: {
        user,
        token,
        email: type === 'adult' ? user.adultEmail : user.parentEmail // Returning the relevant email based on user type
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      status: false,
      message: 'An error occurred during login',
      error: error.toString()
    });
  }
};


/********** userprofile******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const adultFetch = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    // /* Authentication */

    const user = await adultmodel.findById({ _id: userId, isActive: true,inActive:true });
    if (user) {
      return res.json({ status: true, data: user });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Error Occured' });
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
    const { email } = req.body;

    // Initialize variables
    let user;
    let userModel;

    // Try to find the user in kidsmodel
    user = await kidsmodel.findOne({ parentEmail: email, isActive: true,inActive:true });
    if (user) {
      userModel = kidsmodel;
    } else {
      // If not found, try in adultmodel
      user = await adultmodel.findOne({ adultEmail: email, isActive: true,inActive:true });
      if (user) {
        userModel = adultmodel;
      }
    }

    // Check if user was found
    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    // Generate a token for password reset
    const token = crypto.randomBytes(20).toString('hex');

    // Set the token and its expiry in the user document
    user.resetPasswordToken = token;
    user.resetNews
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetLink = `https://hybrid.sicsglobal.com/project/brandsandtalent/reset-password?${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
            auth: {
              user: host,
              pass: pass
            }
          });

    const mailOptions = {
      from: host,
      to: email,
      subject: 'Password Reset',
      html: `
        <p>Hello,</p>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thanks and regards,</p>
        <p>Your HR Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      status: true,
      message: `An e-mail has been sent to ${email} with further instructions.`
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'Error during password reset process.'
    });
  }
};





// const forgotPassword = async (req, res, next) => {
//   try {
//     const token = crypto.randomBytes(20).toString('hex');

//     const user = await kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true });

//     if (!user) {
//       return res.json({
//         status: false,
//         message: 'No account with that email address exists.'
//       });
//     }

//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = moment(Date.now()) + 3600000;

//     await user.save();
//     const resetLink = `https://hybrid.sicsglobal.com/project/brandsandtalent/reset-password?${token}`;
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: host,
//         pass: pass
//       }
//     });
//     const mailOptions = {
//       from: host,
//       to: req.body.parentEmail,
//       subject: 'Password Reset',
//       html: `
//         <p>Hello,</p>
//         <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
//         <p>Please click on the following link to complete the process:</p>
//         <p><a href="${resetLink}">${resetLink}</a></p>
//         <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
//         <p>Thanks and regards,</p>
//         <p>Your HR Team</p>
       
//       `
//     };


//     await transporter.sendMail(mailOptions);

//     res.json({
//       status: true,
//       message: 'An e-mail has been sent to ' + req.body.parentEmail + ' with further instructions.'
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       status: false,
//       message: 'Error during password reset process.'
//     });
//   }
// };

/**
 *********resetPassword ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const resetPassword = async (req, res, next) => {
  try {
    const { password, resetPasswordToken } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    
    // Attempt to find the user in the kids model
    let user = await kidsmodel.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: { $gt: moment(Date.now()) },
    });

    let emailField = "parentEmail"; // Default email field

    if (!user) {
      // If not found in kids model, try adult model
      user = await adultmodel.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpires: { $gt: moment(Date.now()) },
      });
      emailField = "adultEmail"; // Update email field if user is found in adult model
    }

    if (!user) {
      return res.json({
        status: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    // Update the user's password
    user.talentPassword = hashedPass;
    await user.save(); // Save the changes to the database

    // Set up email transport
    const mailOptions = {
      from: host, // Ensure this is correctly defined in your environment
      to: user[emailField], // Use dynamic email field
      subject: 'Password Reset',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account has just been changed.\n',
    };

    await transporter.sendMail(mailOptions); // Send confirmation email

    res.json({
      status: true,
      message: 'Password Changed Successfully',
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'An error occurred during the password reset.',
    });
  }
};


// const resetPassword = async (req, res, next) => {
//   try {
//     const hashedPass = await bcrypt.hash(req.body.password, 10);
//     console.log(hashedPass);

//     const user = await kidsmodel.findOne({
//       resetPasswordToken: req.body.resetPasswordToken,
//       resetPasswordExpires: { $gt: moment(Date.now()) },
//     });

//     if (!user) {
//       return res.json({
//         Status: false,
//         message: 'Password reset token is invalid or has expired.',
//       });
//     }

//     console.log("user.Password", hashedPass);
//     user.talentPassword = hashedPass;

//     const mailOptions = {
//       from: host,
//       to: user.parentEmail,
//       subject: 'Password Reset',
//       text: 'Hello,\n\n' +
//         'This is a confirmation that the password for your account has just been changed.\n',
//     };

//     await transporter.sendMail(mailOptions);

//     await user.save();

//     res.json({
//       status: true,
//       message: 'Password Changed Successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       message: 'An error occurred during password reset.',
//     });
//   }
// };

/**
 *********editUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



const updateAdults = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */

    const user_id = req.body.user_id || req.params.user_id;
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true

      profession: req.body.profession,
      relevantCategories: req.body.relevantCategories,
      parentFirstName: req.body.parentFirstName,
      parentLastName: req.body.parentLastName,
      preferredChildFirstname: req.body.preferredChildFirstname,
      preferredChildLastName: req.body.preferredChildLastName,
      childGender: req.body.childGender,
      childNationality: req.body.childNationality,
      childEthnicity: req.body.childEthnicity,
      languages: req.body.languages,
      childDob: req.body.childDob,
      childPhone: req.body.childPhone,
      contactEmail: req.body.contactEmail,
      country: req.body.country,
      childCity: req.body.childCity,
      childAboutYou: req.body.childAboutYou,
      cv: req.body.cv,
      photo: req.body.photo,
      videosAndAudios: req.body.videosAndAudios,
      features: req.body.features,
      childLocation: req.body.childLocation,
      portfolio: req.body.portfolio,
      instaFollowers: req.body.instaFollowers,
      tiktokFollowers: req.body.tiktokFollowers,
      twitterFollowers: req.body.twitterFollowers,
      youtubeFollowers: req.body.twitterFollowers,
      facebookFollowers: req.body.facebookFollowers,
      linkedinFollowers: req.body.linkedinFollowers,
      threadsFollowers: req.body.threadsFollowers,
      idType: req.body.idType,
      verificationId: req.body.verificationId,
      services: req.body.services,
      bodyType: req.body.bodyType,
      industry: req.body.industry,
      profileStatus: false,
      image: req.body.image,
      age: req.body.age,
      inActive:true,
      maritalStatus:req.body.maritalStatus,
      parentState:req.body.parentState,
      parentAddress:req.body.parentAddress,
      parentCountry:req.body.parentCountry,
      adultLegalFirstName:req.body.adultLegalFirstName,
      adultLegalLastName:req.body.adultLegalLastName,
      reviews:req.body.reviews
    };

    try {
      await adultmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(user_id) },
        { $set: updateFields }
      );
      res.json({ status: true, msg: 'Updated successfully',type:"adult",data:updateFields });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'Error Occurred' });
  }
};

/**
 *********deleteUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const deleteUser = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // Determine the model based on the existence of the userId in kidsmodel or adultmodel
    const model = await determineUserModel(userId);

    if (!model) {
      return res.json({ status: false, msg: 'User not found' });
    }

    try {
      await model.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
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

// Function to determine the model based on userId
async function determineUserModel(userId) {
  try {
    // Check if the userId exists in kidsmodel
    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) {
      return kidsmodel;
    }

    // Check if the userId exists in adultmodel
    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) {
      return adultmodel;
    }

    // If userId does not exist in either model, return null
    return null;
  } catch (error) {
    console.error("Error determining user model:", error);
    return null;
  }
}


// const deleteUser = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     /* Authentication */
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }
//     /* Authentication */

//     try {
//       const user_id = req.body.user_id || req.params.user_id;
//       await kidsmodel.updateOne(
//         { _id: new mongoose.Types.ObjectId(user_id) },
//         { $set: { isActive: false } }
//       );
//       res.json({ status: true, msg: 'Deleted successfully' });
//     } catch (err) {
//       res.json({ status: false, msg: err.message });
//     }
//   } catch (error) {
//     res.json({ status: false, msg: 'Invalid Token' });
//   }
// };
/**
 *********fetchUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const kidsFetch = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    kidsmodel.findOne({ _id: userId, isActive: true,inActive:true }).sort({ created: -1 })
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
  } catch (error) {
    res.json({ status: false, msg: 'Error Occured' });
  }
};

/**
 *********editUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const editKids = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;


    const user = await kidsmodel.findOne({ _id: userId, isActive: true,inActive:true });
    if (!user) {
      return res.status(404).json({ status: false, msg: 'User not found' });
    }


    // Prepare the fields to be updated
    const updateFields = {
     
      parentFirstName: req.body.parentFirstName,
      parentLastName: req.body.parentLastName,
      parentEmail: req.body.parentEmail,
      parentMobileNo: req.body.parentMobileNo,
      parentCountry: req.body.parentCountry,
      parentState: req.body.parentState,
      parentAddress: req.body.parentAddress,
     // confirmPassword: req.body.confirmPassword,
      profession: req.body.profession,
      relevantCategories: req.body.relevantCategories,
      childFirstName: req.body.childFirstName,
      childLastName: req.body.childLastName,
      preferredChildFirstname: req.body.preferredChildFirstname,
      preferredChildLastName: req.body.preferredChildLastName,
      childGender: req.body.childGender,
      childNationality: req.body.childNationality,
      childEthnicity: req.body.childEthnicity,
      languages: req.body.languages,
      childDob: req.body.childDob,
      childPhone: req.body.childPhone,
      childEmail: req.body.childEmail,
      childLocation: req.body.childLocation,
      childCity: req.body.childCity,
      childAboutYou: req.body.childAboutYou,
      cv: req.body.cv,
      videosAndAudios: req.body.videosAndAudios,
      features: req.body.features,
      portfolio: req.body.portfolio,
      instaFollowers: req.body.instaFollowers,
      tiktokFollowers: req.body.tiktokFollowers,
      twitterFollowers: req.body.twitterFollowers,
      youtubeFollowers: req.body.youtubeFollowers,
      facebookFollowers: req.body.facebookFollowers,
      linkedinFollowers: req.body.linkedinFollowers,
      threadsFollowers: req.body.threadsFollowers,
      idType: req.body.idType,
      verificationId: req.body.verificationId,
      reviews: req.body.reviews,
      services: req.body.services,
      image: req.body.image,
      maritalStatus: req.body.maritalStatus,
      age:req.body.age,
      inActive:true

    };

    // Exclude fields that should not be updated directly
    delete updateFields.parentEmail;

    await kidsmodel.updateOne({ _id: userId }, { $set: updateFields });
    res.json({
      status: true,
      msg: 'Updated successfully',
      data: {
        user_id: userId,
        // Do not directly return email for privacy reasons, or ensure it's appropriate to do so
        email: user.parentEmail // Commented for privacy concerns; uncomment if necessary
      }
    })
    // res.json({ status: true, msg: 'Updated successfully, OTP sent to parent email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: 'Error occurred' });
  }
};

/**
 *********unifiedDataFetch*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const unifiedDataFetch = async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    const dataType = parseInt(req.params.dataType);
    const objectId = new mongoose.Types.ObjectId(userId);

    let model;
    const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true,inActive:true });
    const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true,inActive:true });

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(404).json({ status: false, msg: 'User not found or not active' });
    }

    switch (dataType) {
      case 1: {
        const user = await model.findOne({ _id: objectId, isActive: true,inActive:true }, 'portfolio').sort({ createdAt: -1 });;

        if (!user || !user.portfolio || user.portfolio.length === 0) {
          return res.status(200).json({ status: false, msg: 'Portfolio not found' });
        }

        // Transform the portfolio to the desired format
        const fileDataArray = user.portfolio.map(item => item.fileData);
        return res.json({ status: true, data: fileDataArray });
      }
      case 2:
      case 3:
      case 5: {
        //case 6: {
        const selectField = {
          2: 'videosAndAudios',
          3: 'cv',
          5: 'reviews',
          //6: 'services'
        }[dataType];

        const documents = await model.findOne({ _id: objectId, isActive: true,inActive:true }).select(selectField + ' _id').sort({ createdAt: -1 });;

        if (!documents || documents.length === 0 || !documents[selectField]) {
          return res.status(200).json({ status: false, msg: 'No data found' });
        }

        const responseData = documents[selectField].map(item => ({
          _id: documents._id.toString(), // Convert ObjectId to String if necessary
          id: item.id,
          title: item.title,
          fileData: item.fileData,
          type: item.type
        }));

        return res.json({ status: true, data: responseData });
      }
      case 4: {
        const featuresData = await model.findOne({ _id: objectId, isActive: true,inActive:true }, 'features').sort({ createdAt: -1 });;

        if (!featuresData || !featuresData.features || featuresData.features.length === 0) {
          return res.status(200).json({ status: false, msg: 'Features data not found' });
        }

        // Format the features as per requirement
        const formattedFeatures = featuresData.features.map(feature => ({
          label: feature.label,
          value: feature.value
        }));

        return res.json({ status: true, data: formattedFeatures });
      }
      case 6: {
        try {
          const serviceData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'services').sort({ createdAt: -1 });

          if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
            return res.status(200).json({ status: false, msg: 'Services data not found' });
          }

          const formattedServices = serviceData.services.map(service => {
            let editorStateString = '';
            if (Array.isArray(service.editorState)) {
              editorStateString = service.editorState.join(' '); // Joining HTML strings if there are multiple
            } else if (typeof service.editorState === 'string') {
              editorStateString = service.editorState; // Use as is if it's a string
            } else {
              console.error('Unexpected type for service.editorState:', typeof service.editorState);
            }

            return {
              serviceName: service.serviceName,
              serviceAmount: service.serviceAmount,
              serviceDuration: service.serviceDuration,
              editorState: editorStateString,
              files: service.files || [], // Ensure files array exists, handle if it's undefined
            };
          });

          return res.json({ status: true, data: formattedServices });
        // try {
        //   // Assuming "services" is the correct field name in your schema
        //   const serviceData = await model.findOne({ _id: objectId, isActive: true,inActive:true }, 'services').sort({ createdAt: -1 });;

        //   if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
        //     return res.status(200).json({ status: false, msg: 'Services data not found' });
        //   }

        //   // Format the services as per requirement
        //   const formattedServices = serviceData.services.map(service => ({
        //     serviceName: service.serviceName,
        //     serviceAmount: service.serviceAmount,
        //     serviceDuration: service.serviceDuration,
        //     editorState: service.editorState.join(' '), // Joining HTML strings if there are multiple
        //     files: service.files || [], // Ensure files array exists, handle if it's undefined
        //   }));

        //   return res.json({ status: true, data: formattedServices });
        } catch (error) {
          console.error('Error retrieving services data:', error);
          return res.status(500).json({ status: false, msg: 'Server error' });
        }
      }


      default:
        return res.status(400).json({ status: false, msg: 'Invalid request' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};

/*
 *********file delete*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const deleteFile = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const elementIdToRemove = req.body.element_id; // The ID of the element to remove

    // Function to update the user document by removing items from arrays
    const updateUserDocument = async (model) => {
      return await model.findOneAndUpdate(
        { _id: userId },
        {
          $pull: {
            cv: { id: elementIdToRemove },
            videosAndAudios: { id: elementIdToRemove },
            portfolio: { id: elementIdToRemove }
          }
        },
        { new: true } // To return the updated document
      );
    };

    // Try to update the document in kidsmodel
    let updatedUser = await updateUserDocument(kidsmodel);
    let userType = 'kids';

    // If not found in kidsmodel, try in adultmodel
    if (!updatedUser) {
      updatedUser = await updateUserDocument(adultmodel);
      userType = 'adult';
    }

    if (updatedUser) {
      console.log('Successfully removed items from cv, videosAndAudios, and portfolio arrays.');
      res.json({ status: true, msg: `Items successfully removed from ${userType} model.`, updatedUser });
    } else {
      console.log('No items were removed from cv, videosAndAudios, and portfolio arrays.');
      res.json({ status: false, msg: 'No items were removed.', updatedUser: null });
    }
  } catch (error) {
    console.error('Error:', error);
    res.json({ status: false, msg: 'Internal server error.' });
  }
};

// const deleteFile = async (req, res, next) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id; // Replace this with the actual user ID
//     const cvIdToRemove = req.body.element_id; // Replace this with the ID of the cv to remove
//     const videoIdToRemove = req.body.element_id; // Replace this with the ID of the video to remove
//     const audioIdToRemove = req.body.element_id; // Replace this with the ID of the audio to remove
//     const pfIdToRemove = req.body.element_id;

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }

//     // Update the user document to remove items from arrays and return the updated document
//     const updatedUser = await kidsmodel.findOneAndUpdate(
//       { _id: userId },
//       {
//         $pull: {
//           cv: { id: cvIdToRemove },
//           videosAndAudios: { id: { $in: [videoIdToRemove, audioIdToRemove] } },
//           portfolio: { id: pfIdToRemove }
//         }
//       },
//       { new: true } // To return the updated document
//     );

//     if (updatedUser) {
//       console.log('Successfully removed items from cv, videosAndAudios, and portfolio arrays.');
//       res.json({ status: true, msg: 'Items successfully removed.', updatedUser });
//     } else {
//       console.log('No items were removed from cv, videosAndAudios, and portfolio arrays.');
//       res.json({ status: false, msg: 'No items were removed.', updatedUser: null });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     if (error.name === "TokenExpiredError") {
//       res.json({ status: false, msg: 'Token expired' });
//     } else {
//       res.json({ status: false, msg: 'Internal server error.' });
//     }
//   }
// };




/**
 *********otpResend*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const otpResend = async (req, res, next) => {
  try {
    const email = req.body.parentEmail;

    // Generate and hash new OTP
    const { otp, hashedOTP } = await generateAndHashOTP();
console.log("otpp",otp)
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
        console.log("mailOptions", mailOptions);
        console.log("Email sent: " + info.response);
        console.log("email",email)
        console.log("otp",otp)
        // Update the OTP in the database for the user
        try {
          const filter = { parentEmail: email };
          const update = { otp: hashedOTP };
          await kidsmodel.findOneAndUpdate(filter, update);
          console.log("OTP updated successfully in the database");
        } catch (updateError) {
          console.error("Error updating OTP in the database:", updateError);
        }

        res.json({
          message: "OTP sent successfully",
          status: true
        });
      }
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.json({ status: false, msg: "Error Occurred" });
  }
};
/**
 *********otpResend Adult*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



const otpResendAdult = async (req, res, next) => {
  try {
    const email = req.body.adultEmail;

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
        console.log("mailOptions", mailOptions);
        console.log("Email sent: " + info.response);

        // Update the OTP in the database for the user
        try {
          const filter = { adultEmail: email };
          const update = { otp: hashedOTP };
          await adultmodel.findOneAndUpdate(filter, update);
          console.log("OTP updated successfully in the database");
        } catch (updateError) {
          console.error("Error updating OTP in the database:", updateError);
        }

        res.json({
          message: "OTP sent successfully",
          status: true
        });
      }
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.json({ status: false, msg: "Error Occurred" });
  }
};
/**
 *********talentList*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const talentList = async (req, res) => {
  try {

    // Find all active adults
    const activeAdults = await adultmodel.find({ isActive: true,inActive:true });

    // Find all active kids
    const activeKids = await kidsmodel.find({ isActive: true,inActive:true });

    // Combine both lists
    const reversedUsers = [...activeAdults, ...activeKids];

    // Reverse the array
    const allActiveUsers = reversedUsers.reverse();

    if (allActiveUsers.length > 0) {
      return res.json({ status: true, data: allActiveUsers });
    } else {
      return res.json({ status: false, msg: 'No active users found' });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.json({ status: false, msg: 'An error occurred' });
  }
};

/**
 *********talentFilterList*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
*/
const talentFilterData = async (req, res) => {
  try {
    let orConditions = [];

    // Profession filter
    if (req.body.profession && req.body.profession.length) {
      orConditions.push({ 'profession.value': { $in: req.body.profession.map(prof => prof.value) } });
    }

    // Features filter
    if (req.body.features && req.body.features.length) {
      req.body.features.forEach(feature => {
        let condition = {};
        condition[`features.${feature.label}`] = feature.value;
        orConditions.push(condition);
      });
    }

    // Age range filter converted into a date range for childDob
    if (req.body.minAge && req.body.maxAge) {
      const currentDate = new Date();
      const minDateOfBirth = new Date().setFullYear(currentDate.getFullYear() - req.body.maxAge);
      const maxDateOfBirth = new Date().setFullYear(currentDate.getFullYear() - req.body.minAge);
      orConditions.push({ childDob: { $gte: new Date(minDateOfBirth), $lte: new Date(maxDateOfBirth) } });
    }

    // Generic string fields handling (case insensitive)
    const fields = ['adultEmail', 'childNationality', 'gender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['childCity', 'parentCountry','childNationality', 'gender', 'childEthnicity', 'languages', 'childFirstName', 'parentFirstName', 'industry','preferredChildFirstname', 'preferredChildLastName'];
    fields.forEach(field => {
      if (req.body[field]) {
        let condition = {};
        condition[field] = { $regex: new RegExp(req.body[field], 'i') }; // Case-insensitive search
        orConditions.push(condition);
      }
    });

    // Search term filter
    if (req.body.searchTerm) {
      const searchTerm = req.body.searchTerm;
      const searchFields = ['adultEmail', 'childNationality', 'gender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['adultEmail','childNationality', 'gender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const searchTermConditions = searchFields.map(field => ({ [field]: { $regex: new RegExp(searchTerm, 'i') } }));
      orConditions.push(...searchTermConditions);
    }

    // Selected terms filter
    if (req.body.selectedTerms) {
      const selectedTerms = req.body.selectedTerms;
      const selectedTermsFields = ['adultEmail', 'childNationality', 'gender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['adultEmail','childNationality', 'gender', 'childGender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label','industry', 'relevantCategories', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const selectedTermsConditions = selectedTermsFields.map(field => ({ [field]: { $regex: new RegExp(selectedTerms, 'i') } }));
      orConditions.push(...selectedTermsConditions);
    }
         // Add conditions for isActive: true and inActive: true
       orConditions.push({ isActive: true }, { inActive: true });
    // Constructing the final query with all conditions
    let query = orConditions.length ? { $or: orConditions } : {};

    // Executing the query on both collections and combining the results
    const adults = await adultmodel.find(query).exec();
    const kids = await kidsmodel.find(query).exec();
    const combinedResults = [...adults, ...kids];

    // Response based on the combined results
    if (combinedResults.length > 0) {
      res.json({ status: true, data: combinedResults });
    } else {
      res.json({ status: false, msg: 'No matching users found' });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: false, msg: 'An error occurred' });
  }
};

/**
 *********favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const setUserFavorite = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const user = req.body.user
    const type = req.body.type; // Assuming this is passed in the request to distinguish between 'kid' and 'adult'

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */

    let Model; // Determine which model to use based on userType
    if (type === 'kids') {
      Model = kidsmodel;
    } else if (type === 'adult') {
      Model = adultmodel;
    } else {
      return res.json({ status: false, msg: 'Invalid user type' });
    }

    try {
      await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(user) },
        { $set: { isFavorite: true } }
      );
      res.json({ status: true, msg: 'Set as favorite successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } 
  catch (error) {
    res.json({ status: false, msg: 'Invalid Token' });
  }
};
/**
 *********search talent*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const searchTalent = async (req, res, next) => {
  try {
    const { name } = req.body; // Extract the name from the request body

    // Define a query that searches for names starting with the provided input
    const query = {
      $or: [
        // Commented out to match your latest request, but can be included if needed
        // { parentFirstName: new RegExp("^" + name, "i") },
        { childFirstName: new RegExp("^" + name, "i") },
        // { AdultFirstName: new RegExp("^" + name, "i") }
      ]
    };

    // Execute the query on both models concurrently
    const results = await Promise.all([
      adultmodel.find(query),
      kidsmodel.find(query)
    ]);

    // Combine results from both models
    const response = [].concat(...results);

    // Respond with the combined results
    res.json({
      status: true,
      data: response
    });
  } catch (error) {
    console.error("Error in searchTalent:", error);
    res.json({
      status: false,
      message: "An error occurred while searching for talent"
    });
  }
};

/**
 *********profilestatus*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
//  const checkProfileStatus = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     if (!userId) {
//       return res.status(400).json({ status: false, msg: 'User ID is required' });
//     }

//     let userType = '';
//     let profileStatus = null;

//     // Check in adultmodel
//     const adultUser = await adultmodel.find({ 
//       _id: new mongoose.Types.ObjectId(userId), 
//       isActive: true, 
//       inActive: true 
//     }).select('profileStatus _id');

//     if (adultUser) {
//       userType = 'adults';
//       profileStatus = adultUser.profileStatus;
//       return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
//     }

//     // If not found in adultmodel, check in kidsmodel
//     const kidUser = await kidsmodel.find({ 
//       _id: new mongoose.Types.ObjectId(userId), 
//       isActive: true, 
//       inActive: true 
//     }).select('profileStatus _id');

//     if (kidUser) {
//       userType = 'kids';
//       profileStatus = kidUser.profileStatus;
//       return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
//     }

//     // If user type is still empty, user was not found in either model
//     return res.status(404).json({ status: false, msg: 'User not found' });

//   } catch (error) {
//     console.error('Error checking profile status:', error);
//     return res.status(500).json({ status: false, msg: 'Error occurred during profile status check', error: error.message });
//   }
// };

// const checkProfileStatus = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     let userType = '';
//     let profileStatus = null;

//     // Check in adultmodel
//     const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId),isActive:true,inActive:true }).select('profileStatus _id');
//     if (adultUser) {
//       userType = 'adults';
//       profileStatus = adultUser.profileStatus;
//       return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
//     }

//     // If not found in adultmodel, check in kidsmodel without updating
//     const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId),isActive:true,inActive:true }).select('profileStatus _id');
//     if (kidUser) {
//       userType = 'kids';
//       profileStatus = kidUser.profileStatus;
//       return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
//     }

//     // If user type is still empty, user was not found in either model
//     if (!userType) {
//       return res.json({ status: false, msg: 'User not found' });
//     }

//   } catch (error) {
//     console.error('Error checking profile status:', error);
//     return res.json({ status: false, msg: 'Error occurred during profile status check', error: error.message });
//   }
// };

const checkProfileStatus = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    let userType = '';
    let profileStatus = null;

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId),isActive:true})
    if (adultUser.inActive==false) {
      userType = 'adults';
      profileStatus = false;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }
    else {
      userType = 'adults';
      profileStatus = true;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }

    // If not found in adultmodel, check in kidsmodel without updating
    const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId),isActive:true,inActive:true }).select('profileStatus _id');
    if (kidUser) {
      userType = 'kids';
      profileStatus = kidUser.profileStatus;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }

    // If user type is still empty, user was not found in either model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

  } catch (error) {
    console.error('Error checking profile status:', error);
    return res.json({ status: false, msg: 'Error occurred during profile status check', error: error.message });
  }
};



/**
 *********getTalentById*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const getTalentById = async (req, res, next) => {
  try {
    const userId = req.params.user_id;


    let model;
    // Assuming kidsmodel and adultmodel are correctly imported and utilized
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true});
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true });

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(404).json({ status: false, msg: 'User not found or not active' });
    }

    // Query the model to get details of the user
    const userDetails = await model.findOne({ _id: userId, isActive: true });

    if (!userDetails) {
      return res.status(404).json({ status: false, msg: 'User details not found' });
    }

    res.json({ status: true, data: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};
/**
 *********updateProfileStatus*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const updateProfileStatus = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;


    let userType = '';
    let updateResult = null;

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (adultUser) {
      userType = 'adults';
      updateResult = await adultmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { profileStatus: true } }
      );
       // Fetch updated user data
       if (updateResult.modifiedCount > 0) {
        updatedUserData = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      }
    } else {
      // If not found in adultmodel, check in kidsmodel
      const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (kidUser) {
        userType = 'kids';
        updateResult = await kidsmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { profileStatus: true } }
        );
         // Fetch updated user data
         if (updateResult.modifiedCount > 0) {
          updatedUserData = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        }
      }
    }

    // If user type is still empty, user was not found in either model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // // If we have an update result, we successfully updated the profile status
    // if (updateResult) {
    //   return res.json({ status: true, msg: 'Set profile status successfully', type: userType,data:updateResult });
    // } 
    if (updateResult && updatedUserData) {
      return res.json({
        status: true,
        msg: 'Set profile status successfully',
        type: userType,
        data: updatedUserData
      });
    }else {
      return res.json({ status: false, msg: 'Failed to update profile status' });
    }
  } catch (error) {
    console.error('Error checking profile status:', error);
    return res.json({ status: false, msg: 'Invalid Token' });
  }
};
/**
 *********subscriptionStatus*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const subscriptionStatus = async (req, res, next) => {
  try {
    const { email } = req.body; // Destructuring for ease of use

    // Initialize variables
    let model;
    let user;

    // Attempt to find the user in either model
    const kidsUser = await kidsmodel.findOne({ parentEmail: email, isActive: true,inActive:true });
    const adultUser = await adultmodel.findOne({ adultEmail: email, isActive: true,inActive:true});

    // Determine which model the user is in
    if (kidsUser) {
      model = kidsmodel;
      user = kidsUser;
    } else if (adultUser) {
      model = adultmodel;
      user = adultUser;
    } else {
      return res.status(404).json({ status: false, msg: 'User not found or not active' });
    }

    // Update isSubscription to true
    user.isSubscribed = true;
    await user.save();

    // Assuming you have set up Nodemailer configuration correctly
    // with transporter and host variables
    const mailOptions = {
      from: host, // Make sure this is defined or replace with your actual sender's email address
      to: email, // Send to the email from the request
      subject: 'Subscription Status Updated',
      html: `
      <h1>Subscription Update</h1>
      <p>Hello,</p>
      <p>We are pleased to inform you that your subscription status has been <strong>successfully updated</strong> to <em>active</em>.</p>
      <p>This means you now have full access to all the premium features available on our platform. We are excited to have you explore all the great content and features designed to enhance your experience.</p>
      <p>If you have any questions or need assistance, please do not hesitate to contact our support team.</p>
      <p>Thank you for choosing us!</p>
      <p>Best regards,</p>
      <p>Brands And Talent Team</p>
    `,
      // You can use html key instead of text for HTML email content
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: true, data: user, msg: 'Subscription updated and email sent.' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};
/**
 *********getByProfession*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getByProfession = async (req, res) => {
  try {
    // Directly accessing type from the body, assuming the body structure is: { "type": "Photographer" }
    const { type } = req.body;

    // Updated query to match documents where the profession array contains an object with the label matching `type`
    const query = { 'profession.label': type };

    const kidsResults = await kidsmodel.find(query).lean();
    const adultResults = await adultmodel.find(query).lean();

    // Combine results from both models
    const combinedResults = [...kidsResults, ...adultResults];

    res.json({
      status: true,
      data: combinedResults,
    });
  } catch (error) {
    console.error('Error fetching profession data:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};
/**
 *********logintemplate*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const loginTemplate = async (req, res) => {
  try {
    const { parentEmail } = req.body;

    // Ensure email is provided
    if (!parentEmail) {
      return res.status(400).json({
        message: "Parent email is required",
        status: false
      });
    }

    // Update isVerified value to true for the user with the given email
    const updatedUser = await kidsmodel.findOneAndUpdate(
      { parentEmail: parentEmail, isActive: true,inActive:true },
      { $set: { isVerified: true } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found or already verified",
        status: false
      });
    }
    const userId = updatedUser._id; // Assuming _id is the user ID
    const mailOptions = {
      from: host,
      to: parentEmail, // Use the parentEmail from req.body
      subject: 'Welcome to Brands&Talent',
      html: getBusinessReviewEmailTemplate(userId.toString())//getBusinessReviewEmailTemplate() // Assuming this function returns your email template's HTML
    };

    await transporter.sendMail(mailOptions);

    console.log("Success: User verified and email sent");
    res.json({
      message: "User verified and email sent",
      status: true
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred",
      status: false,
      error: error.toString()
    });
  }
};
/**
********getPlanByType******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getPlanByType = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    /* Authentication (Uncomment and adjust as necessary)
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.status(401).json({ status: false, msg: 'Authentication failed' });
    }
    */

    let plan = await kidsmodel.findOne({ _id: userId, isActive: true,inActive:true }).populate('subscriptionId');

    if (!plan) {
      plan = await adultmodel.findOne({ _id: userId, isActive: true,inActive:true }).populate('subscriptionId');
    }

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: 'Plan not found'
      });
    }

    res.json({
      status: true,
      data: plan
    });

  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      status: false,
      message: 'Server error'
    });
  }
};
/**
 *********remove favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const removeFavorite = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const user = req.body.user
    const type = req.body.type; // Assuming this is passed in the request to distinguish between 'kid' and 'adult'

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    let Model; // Determine which model to use based on userType
    if (type === 'kids') {
      Model = kidsmodel;
    } else if (type === 'adult') {
      Model = adultmodel;
    } else {
      return res.json({ status: false, msg: 'Invalid user type' });
    }

    try {
      await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(user) },
        { $set: { isFavorite: false } }
      );
      res.json({ status: true, msg: 'Remove favorite successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'Invalid Token' });
  }
};
/**
 *********remove favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const checkUserStatus = async (req, res, next) => {
  try {
    const userId = req.body.user_id;

    let model;

    // Assuming kidsmodel and adultmodel are correctly imported and utilized
    const kidsUser = await kidsmodel.findById({ _id: userId, isActive: true,inActive:true });
    const adultUser = await adultmodel.findById({ _id: userId, isActive: true,inActive:true });

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(404).json({ status: false, msg: 'New user' });
    }

    // Query the model to get details of the user
    const userDetails = await model.findById({ _id: userId, isActive: true });

    if (!userDetails) {
      return res.json({ status: false, msg: 'New user' });
    }

    res.json({ status: true, data: userDetails, msg: 'This user is already exist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};
/**
*********google Sign up******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const socialSignup = async (req, res, next) => {
  try {
    console.log(req.body);


    // Check if the user already exists
    const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true ,inActive:true});
   

    // Create a new user document
    const newUser = new adultmodel({
      adultEmail: req.body.adultEmail,
      googleId: req.body.googleId,
      provider: req.body.provider,
      isVerified: false,
      userType: 'talent',
      isActive: true,
      type: 'adults',
      isFavorite: false,
      profileStatus: false,
      facebookId:req.body.facebookId,
      inActive:true,
      image:req.body.image

    });

    // Save the new user to the database
    const response = await newUser.save();

    res.json({
      message: "Save successfully",
      status: true,
      email: req.body.adultEmail,
      user_id:newUser._id
    });

  } catch (error) {
    console.error(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
      error: error
    });
  }
};
/**
********editPassword******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const updateAdultPassword = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

   
    const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);

    const updateResult = await adultmodel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { inActive:true,isActive: true, talentPassword: hashedPass } }
    );

    const email = req.body.adultEmail;

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
        console.log("mailOptions", mailOptions);
        console.log("Email sent: " + info.response);

        // Update the OTP in the database for the user
        try {
          const filter = { adultEmail: email };
          const update = { otp: hashedOTP };
          await adultmodel.updateOne(filter, update);
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
/**
 *********Adult forgot password  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



 const adultForgotPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');

    const user = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true,inActive:true });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

    await user.save();
    const resetLink = `https://hybrid.sicsglobal.com/project/brandsandtalent/reset-password/adult/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });
    const mailOptions = {
      from: host,
      to: req.body.adultEmail,
      subject: 'Password Reset',
      html: `
        <p>Hello,</p>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link to complete the process:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thanks and regards,</p>
        <p>Your HR Team</p>
       
      `
    };


    await transporter.sendMail(mailOptions);

    res.json({
      status: true,
      message: 'An e-mail has been sent to ' + req.body.adultEmail + ' with further instructions.'
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
 *********adult resetPassword ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


const adultResetPassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPass);

    const user = await adultmodel.findOne({
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
    user.talentPassword = hashedPass;

    const mailOptions = {
      from: host,
      to: user.adultEmail,
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
 *********fetchUserData ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const fetchUserData = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // Check if the userId exists in adultmodel
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true,inActive:true });
    if (adultUser) {
      return res.json({ status: true, data: adultUser });
    }

    // Check if the userId exists in kidsmodel
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true,inActive:true });
    if (kidsUser) {
      return res.json({ status: true, data: kidsUser });
    }

    // If userId is not found in either model, return appropriate response
    return res.json({ status: false, msg: 'No user found' });
  } catch (error) {
    return res.json({ status: false, msg: 'Error Occurred' });
  }
};
/**
 *********count brands, talents ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const countUsers = async (req, res) => {
  try {
    // Count active users in adultmodel
    const adultUserCount = await adultmodel.countDocuments({ isActive: true,inActive:true });

    // Count active users in kidsmodel
    const kidsUserCount = await kidsmodel.countDocuments({ isActive: true,inActive:true });

    // Count active users in brandsmodel
    const brandUserCount = await brandsmodel.countDocuments({ isActive: true,inActive:true });

    // Calculate talent count (sum of adult and kids users)
    const talentCount = adultUserCount + kidsUserCount;

    // Calculate all users count (sum of talent count and brand users)
    const allUsersCount = talentCount + brandUserCount;

    // Create the array with the counts
    const userCounts = [
      { type: 'adultUserCount', count: adultUserCount },
      { type: 'kidsUserCount', count: kidsUserCount },
      { type: 'brandUserCount', count: brandUserCount },
      { type: 'talentCount', count: talentCount },
      { type: 'allUsersCount', count: allUsersCount }
    ];

    // Return the counts in the response
    return res.json({
      status: true,
      data: userCounts
    });
  } catch (error) {
    console.error("Error counting users:", error);
    return res.json({ status: false, msg: 'Error Occurred' });
  }
};

/**
 *********Deactivate users*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const activateUser = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // Determine the model based on the existence of the userId in kidsmodel or adultmodel
    const model = await determineUserModel(userId);

    if (!model) {
      return res.json({ status: false, msg: 'User not found' });
    }

    try {
      await model.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { inActive: req.body.inActive } }
      );
      res.json({ status: true, msg: 'Updated successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'error' });
  }
};

// Function to determine the model based on userId
async function determineUserModel(userId) {
  try {
    // Check if the userId exists in kidsmodel
    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) {
      return kidsmodel;
    }

    // Check if the userId exists in adultmodel
    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) {
      return adultmodel;
    }

    // If userId does not exist in either model, return null
    return null;
  } catch (error) {
    console.error("Error determining user model:", error);
    return null;
  }
}

/**
 *********addServices*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const addServices = async (req, res) => {
  const { talentId, uniqueId, files } = req.body;

  try {
    // Generate unique IDs for each file
    const filesWithIds = files.map(file => ({
      ...file,
      id: uuidv4()
    }));

    // Define the update operation to push files into the specific service's files array
    const updateOperation = {
      $push: { 'services.$[elem].files': { $each: filesWithIds } }
    };

    // Define arrayFilters to match the service by uniqueId
    const arrayFilters = [{ 'elem.uniqueId': uniqueId }];

    // Try to find the talent in the kids model first and update
    let updatedTalent = await kidsmodel.findOneAndUpdate(
      { _id: talentId },
      updateOperation,
      { new: true, arrayFilters }
    );

    // If not found in kids model, try the adults model
    if (!updatedTalent) {
      updatedTalent = await adultmodel.findOneAndUpdate(
        { _id: talentId },
        updateOperation,
        { new: true, arrayFilters }
      );
    }

    if (!updatedTalent) {
      return res.status(404).json({
        status: false,
        message: 'Talent or service not found'
      });
    }

    // Return the updated talent document
    res.json({
      status: true,
      message: 'Files added to service successfully',
      data: updatedTalent
    });
  } catch (error) {
    console.error('Error adding files to service:', error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while adding the files to the service',
      error: error.message
    });
  }
};
//  const addServices = async (req, res) => {
//   const { talentId, uniqueId, files } = req.body;

//   try {
//     let updatedTalent = null;

//     // Define the update operation to push files into the specific service's files array
//     const updateOperation = {
//       $push: { 'services.$[elem].files': { $each: files } }
//     };

//     // Define arrayFilters to match the service by uniqueId
//     const arrayFilters = [{ 'elem.uniqueId': uniqueId }];

//     // Try to find the talent in the kids model first and update
//     updatedTalent = await kidsmodel.findOneAndUpdate(
//       { _id: talentId },
//       updateOperation,
//       { new: true, arrayFilters }
//     );

//     // If not found in kids model, try the adults model
//     if (!updatedTalent) {
//       updatedTalent = await adultmodel.findOneAndUpdate(
//         { _id: talentId },
//         updateOperation,
//         { new: true, arrayFilters }
//       );
//     }

//     if (!updatedTalent) {
//       return res.status(404).json({
//         status: false,
//         message: 'Talent or service not found'
//       });
//     }

//     // Return the updated talent document
//     res.json({
//       status: true,
//       message: 'File added to service successfully',
//       data: updatedTalent
//     });
//   } catch (error) {
//     console.error('Error adding file to service:', error);
//     res.status(500).json({
//       status: false,
//       message: 'An error occurred while adding the file to the service',
//       error: error.message
//     });
//   }
// };


/**
 *********deleteService*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

 const deleteService = async (req, res) => {
  const { talentId, serviceUniqueId, fileId } = req.body;

  try {
    // Define the update operation to remove the file from the service's files array
    const updateOperation = {
      $pull: { 'services.$.files': { id: fileId } }
    };

    // Try to find the talent in the kids model first and update it
    let updatedTalent = await kidsmodel.findOneAndUpdate(
      { _id: talentId, 'services.uniqueId': serviceUniqueId },
      updateOperation,
      { new: true }
    );

    // If not found in kids model, try to find and update in adults model
    if (!updatedTalent) {
      updatedTalent = await adultmodel.findOneAndUpdate(
        { _id: talentId, 'services.uniqueId': serviceUniqueId },
        updateOperation,
        { new: true }
      );
    }

    // If the talent or service is not found in both models, return 404
    if (!updatedTalent) {
      return res.status(404).json({
        status: false,
        message: 'Talent or service not found'
      });
    }

    // Return the updated talent document
    return res.json({
      status: true,
      message: 'File deleted successfully',
      data: updatedTalent
    });
  } catch (error) {
    // Log the error and return a 500 response
    console.error('Error deleting file:', error);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the file',
      error: error.message
    });
  }
};


/**
 *********applyJobUsersList ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const applyJobUsersList = async (req, res) => {
  try {
    const brandId = req.body.brandId || req.params.brandId;

    if (!brandId) {
      return res.status(400).json({ status: false, msg: 'Brand ID is required' });
    }

    // Find active users who applied for jobs with the given brandId
    const users = await applymodel.find({ brandId: brandId, isActive: true });

    if (users && users.length > 0) {
      return res.json({ status: true, data: users });
    } else {
      return res.json({ status: false, msg: 'No users found' });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ status: false, msg: 'Error Occurred', error: error.message });
  }
};

/**
 *********deleteIndividualService ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const deleteIndividualService = async (req, res) => {
  const { talentId, serviceId } = req.body;

  try {
    // Check if the talentId exists in KidsModel
    let talent = await kidsmodel.findById(talentId);
    let modelType = "kids";

    // If not found in KidsModel, check in AdultModel
    if (!talent) {
      talent = await adultmodel.findById(talentId);
      modelType = "adult";
    }

    // If talentId is not found in either model
    if (!talent) {
      return res.status(404).json({ message: "Talent not found" });
    }

    // Update the respective model
    const updatedTalent = await (modelType === "kids" ? kidsmodel : adultmodel).findByIdAndUpdate(
      talentId,
      { $pull: { services: { uniqueId: serviceId } } },
      { new: true }
    );

    res.status(200).json({status:true, message: "Service deleted successfully", talent: updatedTalent });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({status:false, message: "Internal server error" });
  }
};


/**
 *********type checking ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const typeChecking = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the brand model
    let talent = await brandsmodel.findOne({ brandEmail: email });
    let modelType = "brand";

    // If not found in the brand model, check in the kids model
    if (!talent) {
      talent = await kidsmodel.findOne({ parentEmail: email });
      modelType = "kids";
    }

    // If not found in the kids model, check in the adult model
    if (!talent) {
      talent = await adultmodel.findOne({ adultEmail: email });
      modelType = "adult";
    }

    // If the email is not found in any model
    if (!talent) {
      return res.status(404).json({ status: false, message: "Email not found" });
    }

    res.status(200).json({
      status: true,
      message: "Email found",
      modelType: modelType
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
/*
*********adminApproval*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const adminApproval = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    let userType = '';
    let updateResult = null;

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (adultUser) {
      userType = 'adults';
      updateResult = await adultmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { adminApproval: true } }
      );
    } else {
      // If not found in adultmodel, check in kidsmodel
      const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (kidUser) {
        userType = 'kids';
        updateResult = await kidsmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { adminApproval: true } }
        );
      } else {
        // If not found in kidsmodel, check in brandsmodel
        const brandsUser = await brandsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (brandsUser) {
          userType = 'brands';
          updateResult = await brandsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { adminApproval: true } }
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
      return res.json({ status: true, msg: 'Approved successfully', type: userType });
    } else {
      return res.json({ status: false, msg: 'Failed to Approval' });
    }
  } catch (error) {
    console.error('Error in admin approval:', error);
    return res.status(500).json({ status: false, msg: 'Internal server error' });
  }
};

module.exports = {
  kidsSignUp, adultSignUp, adultFetch, forgotPassword, resetPassword, updateAdults, deleteUser, kidsFetch, otpVerification, subscriptionPlan,
  otpVerificationAdult, editKids, unifiedDataFetch, otpResend, otpResendAdult,
  deleteFile, talentList, talentFilterData, setUserFavorite, talentLogin, searchTalent, checkProfileStatus,
  getTalentById, updateProfileStatus, subscriptionStatus, getByProfession, loginTemplate, getPlanByType,
  removeFavorite, checkUserStatus,socialSignup,updateAdultPassword,adultForgotPassword,adultResetPassword,
  fetchUserData,countUsers,activateUser,addServices,deleteService,applyJobUsersList,deleteIndividualService,
  typeChecking,adminApproval



};