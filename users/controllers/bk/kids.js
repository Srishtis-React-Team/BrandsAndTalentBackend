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

    const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true });

    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }

    // Generate and hash OTP
   // const { otp, hashedOTP } = await generateAndHashOTP();

    // Send OTP after saving user
   // const emailSent = await sendOTPByEmail(req.body.parentEmail, otp);

   // if (emailSent) {
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
        confirmPassword: req.body.confirmPassword,
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
      //  otp: hashedOTP,
        bodyType: req.body.bodyType,
        industry: req.body.industry,
        isFavorite: false,
        bookJob: "25",
        rating: "4",
        maritalStatus: req.body.maritalStatus,
        age: req.body.age,
        profileStatus:false
      });

      // Save the new user to the database
      await newUser.save();
      const mailOptions = {
        from: host,
        to: req.body.parentEmail, // Use the provided newEmail
        subject: 'Welcome to Brands&Talent',
        html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message: "Half Registered Successfully",
        status: true,
        data: { email: newUser.parentEmail, userId: newUser._id }
      });
    // } else {
    //   res.json({
    //     message: "Error sending OTP",
    //     status: false,
    //   });
    // }
  } catch (error) {
    console.error(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
      error: error
    });
  }
};

//  const kidsSignUp = async (req, res, next) => {
//   try {
//     console.log(req.body);

//     const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);

//     console.log("hashedPass", hashedPass);

//     const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail,isActive:true });

//     if (userExist) {
//       console.log("email matches");
//       return res.json({
//         message: "Email ID Already Exists",
//         status: false
//       });
//     }

//     // Generate and hash OTP
//    // const { otp, hashedOTP } = await generateAndHashOTP();

//     // Send OTP after saving user
//    // const email = req.body.parentEmail;
//    // const emailSent = await sendOTPByEmail(email, otp);

//     //if (emailSent) {
//       // Create a new user document
//       const newUser = new kidsmodel({
//         parentFirstName: req.body.parentFirstName,
//         parentLastName: req.body.parentLastName,
//         parentEmail: req.body.parentEmail,
//         parentMobileNo: req.body.parentMobileNo,
//         parentCountry: req.body.parentCountry,
//         parentState: req.body.parentState,
//         parentAddress: req.body.parentAddress,
//         talentPassword: hashedPass,
//         confirmPassword: req.body.confirmPassword,
//         profession: req.body.profession,
//         relevantCategories: req.body.relevantCategories,
//         childFirstName: req.body.childFirstName,
//         childLastName: req.body.childLastName,
//         preferredChildFirstname: req.body.preferredChildFirstname,
//         preferredChildLastName: req.body.preferredChildLastName,
//         childGender: req.body.childGender,
//         childNationality: req.body.childNationality,
//         childEthnicity: req.body.childEthnicity,
//         languages: req.body.languages,
//         childDob: req.body.childDob,
//         childPhone: req.body.childPhone,
//         childEmail: req.body.childEmail,
//         childLocation: req.body.childLocation,
//         childCity: req.body.childCity,
//         childAboutYou: req.body.childAboutYou,
//         // cv: req.body.cv,
//         // videosAndAudios: req.body.videosAndAudios,
//         // features: req.body.features,
//         // portfolio: req.body.portfolio,
//         // instaFollowers: req.body.instaFollowers,
//         // tiktokFollowers: req.body.tiktokFollowers,
//         // twitterFollowers: req.body.twitterFollowers,
//         // youtubeFollowers: req.body.youtubeFollowers,
//         // facebookFollowers: req.body.facebookFollowers,
//         // linkedinFollowers: req.body.linkedinFollowers,
//         // threadsFollowers: req.body.threadsFollowers,
//         // idType: req.body.idType,
//         // verificationId: req.body.verificationId,
//         userType: 'talent',
//         isVerified: false,
//         type: 'kids',
//         isActive: true,
//        // otp: hashedOTP, // Store hashed OTP in the user document
//         bodyType:req.body.bodyType,
//         industry:req.body.industry,
//         isFavorite:false,
//         bookJob:"25",
//         rating:"4"
//       });

//       // Save the new user to the database
//       await newUser.save();

//       res.json({
//         message: "Half Registered Successfully",
//         status: true,
//         data: req.body.parentEmail
//       });
//     // } else {
//     //   res.json({
//     //     message: "Error sending OTP",
//     //     status: false,
//     //   });
//     // }
//   } catch (error) {
//     console.error(error);
//     return res.json({
//       message: "An Error Occurred",
//       status: false,
//       error: error
//     });
//   }
// };


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
    const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true });
    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }

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
        confirmPassword: req.body.confirmPassword,
        isVerified: false,
        userType: 'talent',
        isActive: true,
        type: 'adults', // Assuming type should be set to 'adult'
        otp: hashedOTP,// Store hashed OTP in the user document
        isFavorite: false,
        bookJob: '30',
        rating: '3',
        profileStatus: false,

      });

      // Save the new user to the database
      const response = await newUser.save();

      res.json({
        message: "OTP sent successfully",
        status: true,
        data: req.body.adultEmail
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

      // Send a welcome email to the verified user
      const mailOptions = {
        from: host,
        to: newEmail,
        subject: 'Welcome to Brands&Talent',
        html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
      };

      await transporter.sendMail(mailOptions);

      console.log("Success: User verified and email sent");
      res.json({
        message: "User verified",
        status: true
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
    const user = await kidsmodel.findOne({ parentEmail: newEmail, isActive: true });
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
      // const mailOptions = {
      //   from: host,
      //   to: newEmail, // Use the provided newEmail
      //   subject: 'Welcome to Brands&Talent',
      //   html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
      // };

      // await transporter.sendMail(mailOptions);

      console.log("Success: User verified");
      res.json({
        message: "User verified",
        status: true
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
    const newEmail = req.body.parentEmail;

    // Update subscription plan for the user with the given email

    const userId = req.body.user_id || req.params.user_id;
    const updatedUser = await kidsmodel.findOneAndUpdate(
      { parentEmail: newEmail, isActive: true, _id: userId },
      { subscriptionPlan: req.body.subscriptionPlan },
      { new: true } // To return the updated document
    );

    console.log("Success: Subscription plan updated");
    res.json({
      message: "Subscription plan updated",
      status: true,
      data: updatedUser._id // Return the updated user's ID
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      message: "An error occurred",
      status: false,
      error: error
    });
  }
};

// const subscriptionPlan = async (req, res, next) => {
//   try {

//     const newEmail = req.body.parentEmail;
//     // Update isVerified value to true for the user with the given email
//     await kidsmodel.findOneAndUpdate({ parentEmail: newEmail,isActive:true }, { subscriptionPlan: req.body.subscriptionPlan });


//     // const mailOptions = {
//     //   from: host,
//     //   to: newEmail, // Use the provided newEmail
//     //   subject: 'Welcome to Brands&Talent',
//     //   html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
//     // };

//     // await transporter.sendMail(mailOptions);

//     console.log("Success: User verified and email sent");
//     res.json({
//       message: "User verified and email sent",
//       status: true
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
// const talentLogin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user, type;

//     // Attempt to find the user in the adultmodel
//     user = await adultmodel.findOne({ adultEmail: email, isActive: true });
//     type = 'adult';

//     if (!user) {
//       // If not found in adultmodel, try finding in kidsmodel
//       user = await kidsmodel.findOne({ parentEmail: email, isActive: true });
//       type = 'kids';
//     }

//     // If user is still not found, return an error
//     if (!user) {
//       return res.json({
//         status: false,
//         message: 'User not found'
//       });
//     }

//     // Check if the provided password matches for both adult and kids accounts
//     const isMatch = await bcrypt.compare(password, user.talentPassword);
//     if (!isMatch) {
//       return res.json({
//         status: false,
//         message: 'Password does not match'
//       });
//     }

//     // Proceed with OTP for both adult and kids account
//     const { otp, hashedOTP } = await generateAndHashOTP();

//     // Assuming you have a mechanism to send the OTP via email
//     const emailSent = await sendOTPByEmail(type === 'adult' ? user.adultEmail : user.parentEmail, otp);
//     if (!emailSent) {
//       return res.status(500).json({ status: false, msg: 'Error sending OTP' });
//     }

//     // Update the user with the hashed OTP
//     await (type === 'adult' ? adultmodel : kidsmodel).findByIdAndUpdate(user._id, { otp: hashedOTP });

//     // Generate a token assuming auth.gettoken is a function to do so
//     const token = auth.gettoken(user._id, email, type);

//     // Return success response
//     return res.json({
//       status: true,
//       message: 'OTP sent, please verify',
//       type: type,
//       data: { 
//         user, 
//         token,
//         email: type === 'adult' ? user.adultEmail : user.parentEmail // Returning the relevant email based on user type
//       }
//     });

//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred during login',
//       error: error.toString()
//     });
//   }
// };
//password issue fixed code

const talentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user, type;

    // Attempt to find the user in the adultmodel
    user = await adultmodel.findOne({ adultEmail: email, isActive: true });
    type = 'adult';

    if (!user) {
      // If not found in adultmodel, try finding in kidsmodel
      user = await kidsmodel.findOne({ parentEmail: email, isActive: true });
      type = 'kids';
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

    // Proceed with OTP for kids account
    if (type === 'kids') {
      const { otp, hashedOTP } = await generateAndHashOTP();

      // Assuming you have a mechanism to send the OTP via email
      const emailSent = await sendOTPByEmail(user.parentEmail, otp);
      if (!emailSent) {
        return res.status(500).json({ status: false, msg: 'Error sending OTP' });
      }

      // Update the user with the hashed OTP
      await kidsmodel.findByIdAndUpdate(user._id, { otp: hashedOTP });
    }

    // Generate a token assuming auth.gettoken is a function to do so
    const token = auth.gettoken(user._id, email, type);

    // Return success response
    return res.json({
      status: true,
      message: type === 'adult' ? 'Login successful' : 'OTP sent, please verify',
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

// const talentLogin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user, type;

//     // Attempt to find the user in the adultmodel
//     user = await adultmodel.findOne({ adultEmail: email, isActive: true });
//     type = 'adult';

//     if (!user) {
//       // If not found in adultmodel, try finding in kidsmodel
//       user = await kidsmodel.findOne({ parentEmail: email, isActive: true });
//       type = 'kids';

//       if (user) {
//         // Generate and hash OTP
//         const { otp, hashedOTP } = await generateAndHashOTP();
//         // Attempt to send the OTP via email
//         const emailSent = await sendOTPByEmail(user.parentEmail, otp);
//         if (!emailSent) {
//           return res.status(500).json({ status: false, msg: 'Error sending OTP' });
//         }
//         // Update the user with the hashed OTP
//         await kidsmodel.findByIdAndUpdate(user._id, { otp: hashedOTP });
//       }
//     } else {
//       // OTP generation and sending for adult model
//       const { otp, hashedOTP } = await generateAndHashOTP();
//       const emailSent = await sendOTPByEmail(user.adultEmail, otp);
//       if (!emailSent) {
//         return res.status(500).json({ status: false, msg: 'Error sending OTP' });
//       }
//       await adultmodel.findByIdAndUpdate(user._id, { otp: hashedOTP });
//     }

//     if (!user) {
//       return res.json({ status: false, message: 'User not found' });
//     }

//     if (type === 'adult') {
//       // For adult users, check if the provided password matches
//       const isMatch = await bcrypt.compare(password, user.talentPassword);
//       if (!isMatch) {
//         return res.json({ status: false, message: 'Password does not match' });
//       }
//     }

//     // No password check needed for kids since OTP has been sent

//     // Generate a token assuming auth.getToken is a function to do so
//     const token = auth.getToken(user._id, email, type);

//     // Return success response
//     return res.json({
//       status: true,
//       message: type === 'adult' ? 'Login successful' : 'OTP sent, please verify',
//       type: type,
//       data: { 
//         user,
//         token,
//         email: type === 'adult' ? user.adultEmail : user.parentEmail // Returning the relevant email based on user type
//       }
//     });

//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred during login',
//       error: error.toString()
//     });
//   }
// };
//old code correct
// const talentLogin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user, type;

//     // Attempt to find the user in the adultmodel
//     user = await adultmodel.findOne({ adultEmail: email, isActive: true });
//     type = 'adult';

//     // If not found in adultmodel, try finding in kidsmodel
//     if (!user) {
//       user = await kidsmodel.findOne({ parentEmail: email, isActive: true });
//       type = 'kids';

//       if (user) {
//         const { otp, hashedOTP } = await generateAndHashOTP();

//         // Assuming you have a mechanism to send the OTP via email
//         const emailSent = await sendOTPByEmail(user.parentEmail, otp);
//         if (!emailSent) {
//           return res.status(500).json({ status: false, msg: 'Error sending OTP' });
//         }

//         // Update the user with the hashed OTP
//         await kidsmodel.findByIdAndUpdate(user._id, { otp: hashedOTP });
//       }
//     }

//     // If user is still not found, return an error
//     if (!user) {
//       return res.json({
//         status: false,
//         message: 'User not found'
//       });
//     }

//     // For adult users, check if the provided password matches
//     if (type === 'adult') {
//       const isMatch = await bcrypt.compare(password, user.talentPassword);
//       if (!isMatch) {
//         return res.json({
//           status: false,
//           message: 'Password does not match'
//         });
//       }
//     }
    

//     // If it's a kids account, no further password check is needed here since you're sending an OTP

//     // Generate a token assuming auth.gettoken is a function to do so
//     const token = auth.gettoken(user._id, email, type);

//     // Return success response
//     return res.json({
//       status: true,
//       message: type === 'adult' ? 'Login successful' : 'OTP sent, please verify',
//       type: type,
//       data: { 
//         user, 
//         token,
//         email: type === 'adult' ? user.adultEmail : user.parentEmail // Returning the relevant email based on user type
//       }
//     });
    
//     // return res.json({
//     //   status: true,
//     //   message: type === 'adult' ? 'Login successful' : 'OTP sent, please verify',
//     //   type: type,
//     //   data: { user, token }
//     // });

//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred during login',
//       error: error.toString()
//     });
//   }
// };


// const talentLogin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user, type;

//     // Attempt to find the user in the adultmodel
//     user = await adultmodel.findOne({ adultEmail: email, isActive: true });
//     type = 'adult';

//     // If not found in adultmodel, try finding in kidsmodel
//     if (!user) {
//       user = await kidsmodel.findOne({ parentEmail: email, isActive: true });
//       type = 'kids';
//     }

//     // If user is still not found, return an error
//     if (!user) {
//       return res.json({
//         status: false,
//         message: 'User not found'
//       });
//     }

//     // Check if the provided password matches
//     const isMatch = await bcrypt.compare(password, user.talentPassword);
//     if (!isMatch) {
//       return res.json({
//         status: false,
//         message: 'Password does not match'
//       });
//     }

//     // Generate a token assuming auth.gettoken is a function to do so
//     const token = auth.gettoken(user._id, email);

//     // Return success response
//     return res.json({
//       status: true,
//       message: 'Login successful',
//       type: type,
//       data: { user, token }
//     });

//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.json({
//       status: false,
//       message: 'An error occurred during login',
//       error: error.toString()
//     });
//   }
// };





/********** userprofile******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const adultFetch = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    const user = await adultmodel.findOne({ _id: userId, isActive: true });
    if (user) {
      return res.json({ status: true, data: user });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Invalid Token' });
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

    const user = await kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

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
      to: req.body.parentEmail,
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
      message: 'An e-mail has been sent to ' + req.body.parentEmail + ' with further instructions.'
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
 *********resetPassword ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


const resetPassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPass);

    const user = await kidsmodel.findOne({
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
      to: user.parentEmail,
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
      maritalStatus: req.body.maritalStatus,
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
      age: req.body.age
    };

    try {
      await adultmodel.updateOne(
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
 *********deleteUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteUser = async (req, res) => {
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
      await kidsmodel.updateOne(
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
/**
 *********fetchUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const kidsFetch = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    kidsmodel.findOne({ _id: userId, isActive: true }).sort({ created: -1 })
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
    res.json({ status: false, msg: 'Invalid Token' });
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


    const user = await kidsmodel.findOne({ _id: userId, isActive: true });
    if (!user) {
      return res.status(404).json({ status: false, msg: 'User not found' });
    }

    // Assuming you have a mechanism to generate and hash an OTP
    //const { otp, hashedOTP } = await generateAndHashOTP();

    // Assuming you have a mechanism to send the OTP via email
    // const emailSent = await sendOTPByEmail(user.parentEmail, otp);
    // if (!emailSent) {
    //   return res.status(500).json({ status: false, msg: 'Error sending OTP' });
    // }

    // Prepare the fields to be updated
    const updateFields = {
      // Add all fields you intend to update. Avoid updating the parentEmail here as per the original logic.
      // Example:
      // parentFirstName: req.body.parentFirstName,
      // Include other fields as necessary
      parentFirstName: req.body.parentFirstName,
      parentLastName: req.body.parentLastName,
      parentEmail: req.body.parentEmail,
      parentMobileNo: req.body.parentMobileNo,
      parentCountry: req.body.parentCountry,
      parentState: req.body.parentState,
      parentAddress: req.body.parentAddress,
      confirmPassword: req.body.confirmPassword,
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
     // otp: hashedOTP // Save the hashed OTP for verification purposes
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
//  const editKids = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     /* Authentication */
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }
//     /* Authentication */

//     const user_id = req.body.user_id || req.params.user_id;

//     // First, find the user in the kidsmodel to get the parentEmail
//     const user = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(user_id),isActive:true });
//     if (!user) {
//       return res.json({ status: false, msg: 'User not found' });
//     }
//     const parentEmail = user.parentEmail;

//     // Generate and hash OTP
//     const { otp, hashedOTP } = await generateAndHashOTP();

//     // Send OTP to the parentEmail
//     const emailSent = await sendOTPByEmail(parentEmail, otp);
//     if (!emailSent) {
//       return res.json({ status: false, msg: 'Error sending OTP' });
//     }

//     const updateFields = {
//     isActive: true, // Assuming isActive is always set to true

//       parentFirstName: req.body.parentFirstName,
//       parentLastName: req.body.parentLastName,
//       parentEmail: req.body.parentEmail,
//       parentMobileNo: req.body.parentMobileNo,
//       parentCountry: req.body.parentCountry,
//       parentState: req.body.parentState,
//       parentAddress: req.body.parentAddress,
//       confirmPassword: req.body.confirmPassword,
//       profession: req.body.profession,
//       relevantCategories: req.body.relevantCategories,
//       childFirstName: req.body.childFirstName,
//       childLastName: req.body.childLastName,
//       preferredChildFirstname: req.body.preferredChildFirstname,
//       preferredChildLastName: req.body.preferredChildLastName,
//       childGender: req.body.childGender,
//       childNationality: req.body.childNationality,
//       childEthnicity: req.body.childEthnicity,
//       languages: req.body.languages,
//       childDob: req.body.childDob,
//       childPhone: req.body.childPhone,
//       childEmail: req.body.childEmail,
//       childLocation: req.body.childLocation,
//       childCity: req.body.childCity,
//       childAboutYou: req.body.childAboutYou,
//       cv: req.body.cv,
//       videosAndAudios: req.body.videosAndAudios,
//       features: req.body.features,
//       portfolio: req.body.portfolio,
//       instaFollowers: req.body.instaFollowers,
//       tiktokFollowers: req.body.tiktokFollowers,
//       twitterFollowers: req.body.twitterFollowers,
//       youtubeFollowers: req.body.youtubeFollowers,
//       facebookFollowers: req.body.facebookFollowers,
//       linkedinFollowers: req.body.linkedinFollowers,
//       threadsFollowers: req.body.threadsFollowers,
//       idType: req.body.idType,
//       verificationId: req.body.verificationId,
//       reviews: req.body.reviews,
//       services: req.body.services,
//       otp: hashedOTP,// Store hashed OTP in the user document
//       image:req.body.image 

//       // make sure to exclude parentEmail from updateFields since it's not updated here
//     };

//     try {
//       await kidsmodel.updateOne(
//         { _id: new mongoose.Types.ObjectId(user_id) },
//         { $set: updateFields }
//       );

//       res.json({ status: true, msg: 'Updated successfully' });
//     } catch (err) {
//       res.json({ status: false, msg: err.message });
//     }
//   } catch (error) {
//     res.json({ status: false, msg: 'Error Occurred' });
//   }
// };



//  const editKids = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     /* Authentication */
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }
//     /* Authentication */

//     const user_id = req.body.user_id || req.params.user_id;

//     // Generate and hash OTP
//     const { otp, hashedOTP } = await generateAndHashOTP();

//     // Send OTP after saving user
//     const email = req.body.parentEmail;
//     const emailSent = await sendOTPByEmail(email, otp);

//     if (!emailSent) {
//       return res.json({ status: false, msg: 'Error sending OTP' });
//     }

//     const updateFields = {
//       isActive: true, // Assuming isActive is always set to true

//       parentFirstName: req.body.parentFirstName,
//       parentLastName: req.body.parentLastName,
//       parentEmail: req.body.parentEmail,
//       parentMobileNo: req.body.parentMobileNo,
//       parentCountry: req.body.parentCountry,
//       parentState: req.body.parentState,
//       parentAddress: req.body.parentAddress,
//       confirmPassword: req.body.confirmPassword,
//       profession: req.body.profession,
//       relevantCategories: req.body.relevantCategories,
//       childFirstName: req.body.childFirstName,
//       childLastName: req.body.childLastName,
//       preferredChildFirstname: req.body.preferredChildFirstname,
//       preferredChildLastName: req.body.preferredChildLastName,
//       childGender: req.body.childGender,
//       childNationality: req.body.childNationality,
//       childEthnicity: req.body.childEthnicity,
//       languages: req.body.languages,
//       childDob: req.body.childDob,
//       childPhone: req.body.childPhone,
//       childEmail: req.body.childEmail,
//       childLocation: req.body.childLocation,
//       childCity: req.body.childCity,
//       childAboutYou: req.body.childAboutYou,
//       cv: req.body.cv,
//       videosAndAudios: req.body.videosAndAudios,
//       features: req.body.features,
//       portfolio: req.body.portfolio,
//       instaFollowers: req.body.instaFollowers,
//       tiktokFollowers: req.body.tiktokFollowers,
//       twitterFollowers: req.body.twitterFollowers,
//       youtubeFollowers: req.body.youtubeFollowers,
//       facebookFollowers: req.body.facebookFollowers,
//       linkedinFollowers: req.body.linkedinFollowers,
//       threadsFollowers: req.body.threadsFollowers,
//       idType: req.body.idType,
//       verificationId: req.body.verificationId,
//       reviews: req.body.reviews,
//       services: req.body.services,
//       otp: hashedOTP,// Store hashed OTP in the user document
//       image:req.body.image 
//     };

//     try {
//       await kidsmodel.updateOne(
//         { _id: new mongoose.Types.ObjectId(user_id) },
//         { $set: updateFields }
//       );

//       res.json({ status: true, msg: 'Updated successfully' });
//     } catch (err) {
//       res.json({ status: false, msg: err.message });
//     }
//   } catch (error) {
//     res.json({ status: false, msg: 'Error Occurred' });
//   }
// };


//  const editKids = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     /* Authentication */
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }
//     /* Authentication */

//     const user_id = req.body.user_id || req.params.user_id;
//     const updateFields = {
//       isActive: true, // Assuming isActive is always set to true

//       parentFirstName: req.body.parentFirstName,
//       parentLastName: req.body.parentLastName,
//       parentEmail: req.body.parentEmail,
//       parentMobileNo: req.body.parentMobileNo,
//       parentCountry: req.body.parentCountry,
//       parentState: req.body.parentState,
//       parentAddress: req.body.parentAddress,
//       confirmPassword: req.body.confirmPassword,
//       profession: req.body.profession,
//       relevantCategories: req.body.relevantCategories,
//       childFirstName: req.body.childFirstName,
//       childLastName: req.body.childLastName,
//       preferredChildFirstname: req.body.preferredChildFirstname,
//       preferredChildLastName: req.body.preferredChildLastName,
//       childGender: req.body.childGender,
//       childNationality: req.body.childNationality,
//       childEthnicity: req.body.childEthnicity,
//       languages: req.body.languages,
//       childDob: req.body.childDob,
//       childPhone: req.body.childPhone,
//       childEmail: req.body.childEmail,
//       childLocation: req.body.childLocation,
//       childCity: req.body.childCity,
//       childAboutYou: req.body.childAboutYou,
//       cv: req.body.cv,
//       videosAndAudios: req.body.videosAndAudios,
//       features:req.body.features,
//       portfolio:req.body.portfolio,
//       instaFollowers: req.body.instaFollowers,
//       tiktokFollowers: req.body.tiktokFollowers,
//       twitterFollowers: req.body.twitterFollowers,
//       youtubeFollowers: req.body.youtubeFollowers,
//       facebookFollowers: req.body.facebookFollowers,
//       linkedinFollowers: req.body.linkedinFollowers,
//       threadsFollowers: req.body.threadsFollowers,
//       idType: req.body.idType,
//       verificationId: req.body.verificationId,
//       reviews:req.body.reviews,
//       services:req.body.services
// };

//     try {
//       await kidsmodel.updateOne(
//         { _id: new mongoose.Types.ObjectId(user_id) },
//         { $set: updateFields }
//       );
//       res.json({ status: true, msg: 'Updated successfully' });
//     } catch (err) {
//       res.json({ status: false, msg: err.message });
//     }
//   } catch (error) {
//     res.json({ status: false, msg: 'Error Occurred'});
//   }
// };
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
    const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true });
    const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true });

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(404).json({ status: false, msg: 'User not found or not active' });
    }

    switch (dataType) {
      case 1: {
        const user = await model.findOne({ _id: objectId, isActive: true }, 'portfolio');

        if (!user || !user.portfolio || user.portfolio.length === 0) {
          return res.status(200).json({ status: false, msg: 'Portfolio not found' });
        }

        // Transform the portfolio to the desired format
        const fileDataArray = user.portfolio.map(item => item.fileData);
        return res.json({ status: true, data: fileDataArray });
      }
      case 2:
      case 3:
      case 5:{
      //case 6: {
        const selectField = {
          2: 'videosAndAudios',
          3: 'cv',
          5: 'reviews',
          //6: 'services'
        }[dataType];

        const documents = await model.findOne({ _id: objectId, isActive: true }).select(selectField + ' _id');

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
        const featuresData = await model.findOne({ _id: objectId, isActive: true }, 'features');

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
          // Assuming "services" is the correct field name in your schema
          const serviceData = await model.findOne({ _id: objectId, isActive: true }, 'services');
      
          if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
            return res.status(200).json({ status: false, msg: 'Services data not found' });
          }
      
          // Format the services as per requirement
          const formattedServices = serviceData.services.map(service => ({
            serviceName: service.serviceName,
            serviceAmount: service.serviceAmount,
            serviceDuration: service.serviceDuration,
            editorState: service.editorState.join(' '), // Joining HTML strings if there are multiple
            files: service.files || [], // Ensure files array exists, handle if it's undefined
          }));
      
          return res.json({ status: true, data: formattedServices });
        } catch (error) {
          console.error('Error retrieving services data:', error);
          return res.status(500).json({ status: false, msg: 'Server error' });
        }
      }
      // case 6: {
      //   // Assuming "services" is the correct field name in your schema
      //   const serviceData = await model.findOne({ _id: objectId, isActive: true }, 'services');
        
      //   if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
      //     return res.status(200).json({ status: false, msg: 'Services data not found' });
      //   }
        
      //   // Format the services as per requirement
      //   const formattedServices = serviceData.services.map(service => ({
      //     serviceName: service.serviceName,
      //     serviceAmount: service.serviceAmount,
      //     serviceDuration: service.serviceDuration,
      //     editorState: service.editorState.join(' '), // Joining HTML strings if there are multiple
      //     // Assuming "files" is an array of file references in your service schema
      //     files: service.files.map(file => ({
      //       filename: file.filename,
      //       // Include other file properties as needed
      //     })),
      //   }));
        
      //   return res.json({ status: true, data: formattedServices });
      // }
      
      default:
        return res.status(400).json({ status: false, msg: 'Invalid request' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};



//  const unifiedDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);
//     const objectId = new mongoose.Types.ObjectId(userId);

//     let model;
//     const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true });
//     const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true });

//     if (kidsUser) {
//       model = kidsmodel;
//     } else if (adultUser) {
//       model = adultmodel;
//     } else {
//       return res.status(404).json({ status: false, msg: 'User not found or not active' });
//     }

//     let query;
//     let selectField = '';
//     switch (dataType) {
//       case 1:
//                 const user = await model.findOne({ _id: objectId, isActive: true }, 'portfolio');

//         if (!user || !user.portfolio || user.portfolio.length === 0) {
//           return res.status(404).json({ status: false, msg: 'Portfolio not found' });
//         }

//         // Transform the portfolio to the desired format
//         const fileDataArray = user.portfolio.map(item => item.fileData);
//         return res.json({ status: true, data: fileDataArray });
//         // Portfolio case is handled differently, so it's not included here.
//         break;
//       case 2:
//         selectField = 'videosAndAudios';
//         break;
//       case 3:
//         selectField = 'cv';
//         break;
//       case 4:
//         const features = document[selectField].map(item => ({
//           label: item.label,
//           value: item.value
//         }));
//         break;
//       case 5:
//         selectField = 'reviews';
//         break;
//       case 6:
//         selectField = 'services';
//         break;
//       default:
//         return res.status(400).json({ status: false, msg: 'Invalid request' });
//     }

//     if (!selectField) {
//       return res.status(400).json({ status: false, msg: 'Data type for portfolio must be handled separately' });
//     }

//     // Assuming the model's structure is { _id, [selectField]: [{ id, title, fileData, type }] }
//     const documents = await model.findOne({ _id: objectId, isActive: true }).select(selectField + ' _id');

//     if (!documents || documents.length === 0 || !documents[selectField]) {
//       return res.status(404).json({ status: false, msg: 'No data found' });
//     }

//     const responseData = documents[selectField].map(item => ({
//       _id: documents._id.toString(), // Convert ObjectId to String if necessary
//       id: item.id,
//       title: item.title,
//       fileData: item.fileData,
//       type: item.type
//     }));

//     res.json({ status: true, data: responseData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
//   }
// };








//correct
//  const unifiedDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);
//     const objectId = new mongoose.Types.ObjectId(userId); // Ensure this is valid and mongoose is imported


//     let model;
//     // Assuming kidsmodel and adultmodel are correctly imported and utilized
//     const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true }); // Use objectId
//     const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true }); // Use objectId

//     if (kidsUser) {
//       model = kidsmodel;
//     } else if (adultUser) {
//       model = adultmodel;
//     } else {
//       return res.status(404).json({ status: false, msg: 'User not found or not active' }); // User not found
//     }

//     let query;
//     // Ensure correct aggregation or query based on dataType
//     switch (dataType) {
//       case 1:
//         const user = await model.findOne({ _id: objectId, isActive: true }, 'portfolio');

//         if (!user || !user.portfolio || user.portfolio.length === 0) {
//           return res.status(404).json({ status: false, msg: 'Portfolio not found' });
//         }

//         // Transform the portfolio to the desired format
//         const fileDataArray = user.portfolio.map(item => item.fileData);
//         return res.json({ status: true, data: fileDataArray });
//       case 2:
//         query = model.find({ _id: objectId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = model.find({ _id: objectId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = model.find({ _id: objectId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//       case 5:
//         query = model.find({ _id: objectId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
//         break;
//       case 6:
//         query = model.find({ _id: objectId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
//         break;
//       // Cases 2-6 are assumed to be correct
//       default:
//         return res.status(400).json({ status: false, msg: 'Invalid request' });
//     }

//     const response = await query;
//     if (!response || response.length === 0) {
//       return res.status(404).json({ status: false, msg: 'No data found' });
//     }

//     res.json({ status: true, data: response });
//   } catch (error) {
//     console.error(error); // Log the error
//     res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
//   }
// };


//  const unifiedDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);
//     const objectId = new mongoose.Types.ObjectId(userId); // Ensure this is valid and mongoose is imported

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.status(401).json({ status: false, msg: 'Authentication failed' }); // Use proper status codes
//     }

//     let model;
//     // Assuming kidsmodel and adultmodel are correctly imported and utilized
//     const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true }); // Use objectId
//     const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true }); // Use objectId

//     if (kidsUser) {
//       model = kidsmodel;
//     } else if (adultUser) {
//       model = adultmodel;
//     } else {
//       return res.status(404).json({ status: false, msg: 'User not found or not active' }); // User not found
//     }

//     let query;
//     // Ensure correct aggregation or query based on dataType
//     switch (dataType) {
//       case 1:
//         const user = await model.findOne({ _id: objectId, isActive: true }, 'portfolio');

//         if (!user || !user.portfolio || user.portfolio.length === 0) {
//           return res.status(404).json({ status: false, msg: 'Portfolio not found' });
//         }

//         // Transform the portfolio to the desired format
//         const transformedPortfolio = user.portfolio.map(item => ({
//           fileData: item.fileData
//         }));
//         break;
//       // case 1:
//       //   query = model.aggregate([
//       //     { $match: { _id: objectId, isActive: true, "portfolio": { $exists: true, $ne: [] } } },
//       //     { $unwind: "$portfolio" },
//       //     { $project: { _id: 0, fileData: "$portfolio.fileData" } }
//       //   ]);
//       //   break;
//         case 2:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//       case 5:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
//         break;
//       case 6:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
//         break;
//       // Cases 2-6 are assumed to be correct
//       default:
//         return res.status(400).json({ status: false, msg: 'Invalid request' });
//     }

//     const response = await query;
//     if (!response || response.length === 0) {
//       return res.status(404).json({ status: false, msg: 'No data found' });
//     }

//     res.json({ status: true, data: response });
//   } catch (error) {
//     console.error(error); // Log the error
//     res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
//   }
// };

//  const unifiedDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);
//     const objectId = mongoose.Types.ObjectId(userId);

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }

//     // Determine the user type by checking the appropriate model
//     let model;
//     const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true }).sort({ created: -1 }).select({ type: 1 });
//     const adultUser = await adultmodel.findOne({ _id: userId, isActive: true }).sort({ created: -1 }).select({ type: 1 });

//     if (kidsUser) {
//       model = kidsmodel;
//     } else if (adultUser) {
//       model = adultmodel;
//     } else {
//       return res.json({ status: false, msg: 'User not found or not active' });
//     }

//     let query;

//     switch (dataType) {
//       case 1:
//           query = model.aggregate([
//             { $match: { _id: objectId, isActive: true, "portfolio": { $exists: true, $ne: [] } } },
//             { $unwind: "$portfolio" },
//             { $project: { _id: 0, fileData: "$portfolio.fileData" } }
//           ]);
//           break;
//       case 2:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//       case 5:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
//         break;
//       case 6:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
//         break;
//       default:
//         return res.json({ status: false, msg: 'Invalid request' });
//     }

//     const response = await query;
//     res.json({ status: true, data: response });
//   } catch (error) {
//     res.json({ status: false, msg: 'Invalid Token' });
//   }
// };




//  const unifiedDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }
//     //

//     let model = type === 'kids' ? kidsmodel : adultmodel;
//     let query;

//     switch (dataType) {
//       case 1:
//         query = model.aggregate([
//           { $match: { _id: userId, isActive: true } },
//           { $unwind: "$portfolio" }, // Unwind the portfolio array
//           { $project: { fileData: "$portfolio.fileData" } } // Project only the fileData field
//         ]);
//       // case 1:
//       //   query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
//       //   break;
//       case 2:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//       case 5:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
//         break;
//       case 6:
//         query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
//         break;
//       default:
//         return res.json({ status: false, msg: 'Invalid request' });
//     }

//     const response = await query;
//     res.json({ status: true, data: response });
//   } catch (error) {
//     res.json({ status: false, msg: 'Invalid Token' });
//   }
// };


/**
 *********file delete*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteFile = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id; // Replace this with the actual user ID
    const cvIdToRemove = req.body.element_id; // Replace this with the ID of the cv to remove
    const videoIdToRemove = req.body.element_id; // Replace this with the ID of the video to remove
    const audioIdToRemove = req.body.element_id; // Replace this with the ID of the audio to remove
    const pfIdToRemove = req.body.element_id;

    // Check authentication
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }

    // Update the user document to remove items from arrays and return the updated document
    const updatedUser = await kidsmodel.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          cv: { id: cvIdToRemove },
          videosAndAudios: { id: { $in: [videoIdToRemove, audioIdToRemove] } },
          portfolio: { id: pfIdToRemove }
        }
      },
      { new: true } // To return the updated document
    );

    if (updatedUser) {
      console.log('Successfully removed items from cv, videosAndAudios, and portfolio arrays.');
      res.json({ status: true, msg: 'Items successfully removed.', updatedUser });
    } else {
      console.log('No items were removed from cv, videosAndAudios, and portfolio arrays.');
      res.json({ status: false, msg: 'No items were removed.', updatedUser: null });
    }
  } catch (error) {
    console.error('Error:', error);
    if (error.name === "TokenExpiredError") {
      res.json({ status: false, msg: 'Token expired' });
    } else {
      res.json({ status: false, msg: 'Internal server error.' });
    }
  }
};




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
    const activeAdults = await adultmodel.find({ isActive: true });

    // Find all active kids
    const activeKids = await kidsmodel.find({ isActive: true });

    // Combine both lists
    const  reversedUsers= [...activeAdults, ...activeKids];

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

// const talentList = async (req, res) => {
//   try {

//     // Find all active adults
//     const activeAdults = await adultmodel.find({ isActive: true });

//     // Find all active kids
//     const activeKids = await kidsmodel.find({ isActive: true });

//     // Combine both lists
//     const allActiveUsers = [...activeAdults, ...activeKids];

//     if (allActiveUsers.length > 0) {
//       return res.json({ status: true, data: allActiveUsers });
//     } else {
//       return res.json({ status: false, msg: 'No active users found' });
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return res.json({ status: false, msg: 'An error occurred' });
//   }
// };
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
    const fields = ['childCity', 'parentCountry', 'gender', 'childEthnicity', 'languages', 'childFirstName', 'parentFirstName', 'industry'];
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
      const searchFields = ['adultEmail', 'childGender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const searchTermConditions = searchFields.map(field => ({ [field]: { $regex: new RegExp(searchTerm, 'i') } }));
      orConditions.push(...searchTermConditions);
    }

    // Selected terms filter
    if (req.body.selectedTerms) {
      const selectedTerms = req.body.selectedTerms;
      const selectedTermsFields = ['adultEmail', 'childGender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const selectedTermsConditions = selectedTermsFields.map(field => ({ [field]: { $regex: new RegExp(selectedTerms, 'i') } }));
      orConditions.push(...selectedTermsConditions);
    }

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

//final correct code

// const talentFilterData = async (req, res) => {
//   try {
//     let orConditions = [];

//     // Profession filter
//     if (req.body.profession && req.body.profession.length) {
//       orConditions.push({ 'profession.value': { $in: req.body.profession.map(prof => prof.value) } });
//     }

//     // Features filter
//     if (req.body.features && req.body.features.length) {
//       req.body.features.forEach(feature => {
//         let condition = {};
//         condition[`features.${feature.label}`] = feature.value;
//         orConditions.push(condition);
//       });
//     }

//     // Age range filter converted into a date range for childDob
//     if (req.body.minAge && req.body.maxAge) {
//       const currentDate = new Date();
//       const minDateOfBirth = new Date().setFullYear(currentDate.getFullYear() - req.body.maxAge);
//       const maxDateOfBirth = new Date().setFullYear(currentDate.getFullYear() - req.body.minAge);
//       orConditions.push({ childDob: { $gte: new Date(minDateOfBirth), $lte: new Date(maxDateOfBirth) } });
//     }

//     // Generic string fields handling (case insensitive)
//     const fields = ['childCity', 'parentCountry', 'gender', 'childEthnicity', 'languages', 'childFirstName', 'parentFirstName', 'industry', 'searchTerm', 'selectedTerms'];
//     fields.forEach(field => {
//       if (req.body[field]) {
//         let condition = {};
//         condition[field] = { $regex: new RegExp(req.body[field], 'i') }; // Case-insensitive search
//         orConditions.push(condition);
//       }
//     });
    

//     // Constructing the final query with all conditions
//     let query = orConditions.length ? { $or: orConditions } : {};

//     // Executing the query on both collections and combining the results
//     const adults = await adultmodel.find(query).exec();
//     const kids = await kidsmodel.find(query).exec();
//     const combinedResults = [...adults, ...kids];

//     // Response based on the combined results
//     if (combinedResults.length > 0) {
//       res.json({ status: true, data: combinedResults });
//     } else {
//       res.json({ status: false, msg: 'No matching users found' });
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ status: false, msg: 'An error occurred' });
//   }
// };

// const talentFilterData = async (req, res) => {
//   try {
//     // Initialize an array to hold all parts of the $or condition
//     let orConditions = [];

//     // Handle profession field
//     if (req.body.profession && req.body.profession.length) {
//       orConditions.push({ 'profession.value': { $in: req.body.profession.map(prof => prof.value) } });
//     }

//     // Handle features field
//     if (req.body.features && req.body.features.length) {
//       req.body.features.forEach(feature => {
//         let condition = {};
//         condition[`features.${feature.label}`] = feature.value;
//         orConditions.push(condition);
//       });
//     }

//     // Handle the age range by converting it into a date range
//     if (req.body.minAge && req.body.maxAge) {
//       const currentDate = new Date();
//       const minDateOfBirth = new Date(new Date().setFullYear(currentDate.getFullYear() - req.body.maxAge));
//       const maxDateOfBirth = new Date(new Date().setFullYear(currentDate.getFullYear() - req.body.minAge));
//       orConditions.push({ 'childDob': { $gte: minDateOfBirth, $lte: maxDateOfBirth } });
//     }

//     // Handle other straightforward string matches (case insensitive)
//     ['childCity', 'parentCountry', 'gender', 'childEthnicity', 'languages', 'childFirstName', 'parentFirstName', 'industry', 'searchTerm', 'selectedTerms'].forEach(field => {
//       if (req.body[field]) {
//         let condition = {};
//         condition[field] = { $regex: new RegExp(req.body[field], 'i') };
//         orConditions.push(condition);
//       }
//     });

//     // Construct the final query
//     let query = {};
//     if (orConditions.length) query.$or = orConditions;

//     // Query both collections and combine the results
//     const adults = await adultmodel.find(query).exec();
//     const kids = await kidsmodel.find(query).exec();
//     const combinedResults = [...adults, ...kids];

//     if (combinedResults.length > 0) {
//       res.json({ status: true, data: combinedResults });
//     } else {
//       res.json({ status: false, msg: 'No matching users found' });
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ status: false, msg: 'An error occurred' });
//   }
// };




//correct single

// const talentFilterData = async (req, res) => {
//   try {
//     let filterCriteria = {
//       isActive: true,
//     };

//     let hasFilters = false; // Flag to identify if any filters are being applied

//     // Fields that can be filtered upon
//     const fieldsToCheck = [
//       "childCity", "instaFollowers", "tiktokFollowers", "twitterFollowers",
//       "youtubeFollowers", "facebookFollowers", "linkedinFollowers", "threadsFollowers",
//       "childGender", "parentCountry", "childDob", "childEthnicity", "childNationality", "languages",
//       "parentFirstName", "childFirstName"
//     ];

//     // Check for filters in the request body and add them to the filterCriteria
//     fieldsToCheck.forEach(field => {
//       if (req.body[field] !== undefined && req.body[field] !== '') {
//         hasFilters = true; // Indicates that at least one filter is applied
//         if (typeof req.body[field] === 'string') {
//           // Use regex for case-insensitive search for string fields
//           filterCriteria[field] = { $regex: new RegExp(req.body[field], 'i') };
//         } else {
//           // Direct matching for non-string fields
//           filterCriteria[field] = req.body[field];
//         }
//       }
//     });
    
//     if (req.body.searchTerm) {
//       hasFilters = true;
//       const searchTerm = req.body.searchTerm;
//       // Fields you want to search the keyword in
//       const searchFields =  ["adultEmail","childGender","contactEmail","country","parentFirstName", "parentLastName", "parentEmail", "parentMobileNo", "parentCountry", "parentState", "parentAddress", "profession.value", "profession.label","relevantCategories", "childFirstName", "childLastName", "preferredChildFirstname", "preferredChildLastName", "childGender", "childNationality", "childEthnicity", "languages", "childPhone", "childEmail", "childLocation", "childCity", "childAboutYou","services","portfolio","features.label","features.value","maritalStatus"];
//       // Constructing an OR query to find the keyword in any of the specified fields
//       filterCriteria.$or = searchFields.map(field => ({ [field]: { $regex: new RegExp(searchTerm, 'i') } }));
//     }
//     if (req.body.selectedTerms) {
//       hasFilters = true;
//       const searchTerm = req.body.selectedTerms;
//       // Fields you want to search the keyword in
//       const searchFields =  ["adultEmail","childGender","contactEmail","country","parentFirstName", "parentLastName", "parentEmail", "parentMobileNo", "parentCountry", "parentState", "parentAddress", "profession.value", "profession.label","relevantCategories", "childFirstName", "childLastName", "preferredChildFirstname", "preferredChildLastName", "childGender", "childNationality", "childEthnicity", "languages", "childPhone", "childEmail", "childLocation", "childCity", "childAboutYou","services","portfolio","features.label","features.value","maritalStatus"];
//       // Constructing an OR query to find the keyword in any of the specified fields
//       filterCriteria.$or = searchFields.map(field => ({ [field]: { $regex: new RegExp(searchTerm, 'i') } }));
//     }
//     // Special handling for "features" and "profession" filters, if provided
//     if (req.body.features && req.body.features.length > 0) {
//       hasFilters = true;
//       filterCriteria.features = { $all: req.body.features.map(feature => ({ $elemMatch: { label: feature.label, value: feature.value } })) };
//     }

//     if (req.body.profession && req.body.profession.length > 0) {
//       hasFilters = true;
//       // Adjusting query for profession to use $in for matching any provided profession
//       filterCriteria['profession.value'] = { $in: req.body.profession.map(prof => prof.value) };
//     }
    
//    // Age filter
//    if (req.body.minAge !== undefined && req.body.maxAge !== undefined) {
//     hasFilters = true;
//     const minAge = parseInt(req.body.minAge);
//     const maxAge = parseInt(req.body.maxAge);
//     filterCriteria.age = { $gte: minAge, $lte: maxAge };
//   }
//     // Execute the query only if there are filters set (hasFilters is true)
//     let allActiveUsers = [];
//     if (hasFilters) {
//       // Query both models concurrently only if filters are present
//       const [activeAdults, activeKids] = await Promise.all([
//         adultmodel.find(filterCriteria),
//         kidsmodel.find(filterCriteria)
//       ]);

//       allActiveUsers = [...activeAdults, ...activeKids];
//     }

//     // Respond with the query results
//     if (allActiveUsers.length > 0) {
//       res.json({ status: true, data: allActiveUsers });
//     } else {
//       res.json({ status: false, msg: 'No matching users found' });
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ status: false, msg: 'An error occurred' });
//   }
// };




/**
 *********favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const setUserFavorite = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
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
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { isFavorite: true } }
      );
      res.json({ status: true, msg: 'Set as favorite successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
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
const checkProfileStatus = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    let userType = '';
    let profileStatus = null;

    // Check in adultmodel
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) }).select('profileStatus -_id'); // Adjusted to only select profileStatus
    if (adultUser) {
      userType = 'adults';
      profileStatus = adultUser.profileStatus;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }

    // If not found in adultmodel, check in kidsmodel
    const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (kidUser) {
      userType = 'kids';
      // Here, since you want to update the kidsmodel, let's proceed with the update.
      const updateResult = await kidsmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { profileStatus: true } }
      );
      if (updateResult && updateResult.modifiedCount === 1) {
        // Assuming you want to return the updated status, fetch it again
        const updatedKidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) }).select('profileStatus -_id');
        profileStatus = updatedKidUser.profileStatus;
        return res.json({ status: true, msg: 'Set profile status successfully', type: userType, data: profileStatus });
      } else {
        return res.json({ status: false, msg: 'Failed to update profile status for kid user' });
      }
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

//  const checkProfileStatus = async (req, res) => {
//   try {
//     const userId = req.body.user_id || req.params.user_id;

//     /* Authentication */
//     // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     // if (!authResult) {
//     //   return res.json({ status: false, msg: 'Authentication failed' });
//     // }
//     /* Authentication */

//     let userType = '';
//     let updateResult = null;

//     // Check in adultmodel
//     const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
//     if (adultUser) {
//       userType = 'adults';
//       updateResult = await adultmodel.updateOne(
//         { _id: new mongoose.Types.ObjectId(userId) },
//         { $set: { profileStatus: true } }
//       );
//     } else {
//       // If not found in adultmodel, check in kidsmodel
//       const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
//       if (kidUser) {
//         userType = 'kids';
//         updateResult = await kidsmodel.updateOne(
//           { _id: new mongoose.Types.ObjectId(userId) },
//           { $set: { profileStatus: true } }
//         );
//       }
//     }

//     // If user type is still empty, user was not found in either model
//     if (!userType) {
//       return res.json({ status: false, msg: 'User not found' });
//     }

//     // If we have an update result, we successfully updated the profile status
//     if (updateResult) {
//       return res.json({ status: true, msg: 'Set profile status successfully', type: userType });
//     } else {
//       return res.json({ status: false, msg: 'Failed to update profile status' });
//     }
//   } catch (error) {
//     console.error('Error checking profile status:', error);
//     return res.json({ status: false, msg: 'Invalid Token' });
//   }
// };




const getTalentById = async (req, res, next) => {
  try {
    const userId = req.params.user_id;


    let model;
    // Assuming kidsmodel and adultmodel are correctly imported and utilized
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true });
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

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */

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
    } else {
      // If not found in adultmodel, check in kidsmodel
      const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (kidUser) {
        userType = 'kids';
        updateResult = await kidsmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { profileStatus: true } }
        );
      }
    }

    // If user type is still empty, user was not found in either model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // If we have an update result, we successfully updated the profile status
    if (updateResult) {
      return res.json({ status: true, msg: 'Set profile status successfully', type: userType });
    } else {
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
    const kidsUser = await kidsmodel.findOne({ parentEmail: email, isActive: true });
    const adultUser = await adultmodel.findOne({ adultEmail: email, isActive: true });

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





module.exports = {
  kidsSignUp, adultSignUp, adultFetch, forgotPassword, resetPassword, updateAdults, deleteUser, kidsFetch, otpVerification, subscriptionPlan,
  otpVerificationAdult, editKids, unifiedDataFetch, otpResend, otpResendAdult,
  deleteFile, talentList, talentFilterData, setUserFavorite, talentLogin, searchTalent, checkProfileStatus,
  getTalentById, updateProfileStatus,subscriptionStatus,getByProfession



};