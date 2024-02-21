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

    const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail });

    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }

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
        userType: 'talent',
        isVerified: false,
        type: 'kids',
        isActive: true,
        otp: hashedOTP // Store hashed OTP in the user document
      });

      // Save the new user to the database
      await newUser.save();

      res.json({
        message: "OTP sent successfully",
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
    const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail });
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
        confirmPassword:req.body.confirmPassword,
        isVerified: false,
        userType: 'talent',
        isActive: true,
        type: 'adult', // Assuming type should be set to 'adult'
        otp: hashedOTP // Store hashed OTP in the user document
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
    const user = await adultmodel.findOne({ adultEmail: newEmail });
    console.log("user",user)
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
    const user = await kidsmodel.findOne({ parentEmail: newEmail });
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



// const otpVerification = async (req, res, next) => {
//   try {
//     const inputOTP = req.body.otp;
//     const sessionOTP = req.session.otp; // Retrieve the OTP from the session
//     const newEmail = req.body.parentEmail;

//     const isMatch = verifyOTP(sessionOTP, inputOTP);
//     console.log(`OTP match: ${isMatch}`);

//     if (isMatch) {
//       // Update isVerified value to true for the user with the given email
//       await kidsmodel.findOneAndUpdate({ parentEmail: newEmail }, { isVerified: true });


//       // const mailOptions = {
//       //   from: host,
//       //   to: newEmail, // Use the provided newEmail
//       //   subject: 'Welcome to Brands&Talent',
//       //   html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
//       // };

//       // await transporter.sendMail(mailOptions);

//       console.log("Success: User verified and email sent");
//       res.json({
//         message: "User verified",
//         status: true
//       });
//     } else {
//       console.log("Error: OTP does not match");
//       res.json({
//         message: "OTP does not match",
//         status: false
//       });
//     }
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
*********subscription******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const subscriptionPlan = async (req, res, next) => {
  try {

    const newEmail = req.body.parentEmail;
    // Update isVerified value to true for the user with the given email
    await kidsmodel.findOneAndUpdate({ parentEmail: newEmail }, { subscriptionPlan: req.body.subscriptionPlan });


    const mailOptions = {
      from: host,
      to: newEmail, // Use the provided newEmail
      subject: 'Welcome to Brands&Talent',
      html: getBusinessReviewEmailTemplate() // Assuming you have the email template function
    };

    await transporter.sendMail(mailOptions);

    console.log("Success: User verified and email sent");
    res.json({
      message: "User verified and email sent",
      status: true
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




/**
*********userLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const kidsLogin = async (req, res, next) => {
  const username = req.body.parentEmail;
  const password = req.body.talentPassword;
 

  try {
    const user = await kidsmodel.findOne({ $or: [{ parentEmail: username }, { parentEmail: username }] });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.talentPassword);

      if (passwordMatch) {
        const token = auth.gettoken(user._id, user.parentEmail);

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

/**
*********adultLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const adultLogin = async (req, res, next) => {
  const username = req.body.adultEmail;
  const password = req.body.talentPassword;
  

  try {
    const user = await adultmodel.findOne({ $or: [{ adultEmail: username }, { adultEmail: username }] });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.talentPassword);

      if (passwordMatch) {
        const token = auth.gettoken(user._id, user.adultEmail);

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

    const user = await kidsmodel.findOne({ parentEmail: req.body.parentEmail });

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
      to: req.body.parentEmail,
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
 *********Reset password ******
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
    user.password = hashedPass;

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


const editAdult = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    const user_id = req.body.user_id || req.params.user_id;
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true

      profession: req.body.profession,
      relevantCategories: req.body.relevantCategories,
      AdultFirstName: req.body.AdultFirstName,
      AdultLastName: req.body.AdultLastName,
      preferredAdultFirstname: req.body.preferredAdultFirstname,
      preferredAdultLastName: req.body.preferredAdultLastName,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      nationality: req.body.nationality,
      ethnicity: req.body.ethnicity,
      languages: req.body.languages,
      dob: req.body.dob,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      country: req.body.country,
      city: req.body.city,
      aboutYou: req.body.aboutYou,
      cv: req.body.cv,
      photo: req.body.photo,
      videosAndAudios: req.body.videosAndAudios,
      hairColour: req.body.hairColour,
      hairType: req.body.hairType,
      build: req.body.build,
      skinType: req.body.skinType,
      eyeColour: req.body.eyeColour,
      hairLength: req.body.hairLength,
      chest: req.body.chest,
      waist: req.body.waist,
      hipSize: req.body.hipSize,
      dressSize: req.body.dressSize,
      shoeSize: req.body.shoeSize,
      braSize: req.body.braSize,
      transgender: req.body.transgender,
      sexuality: req.body.sexuality,
      height: req.body.height,
      children: req.body.children,
      pets: req.body.pets,
      diet: req.body.diet,
      weight: req.body.weight,
      neckToToe: req.body.neckToToe,
      insideLeg: req.body.insideLeg,
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
      services:req.body.services
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

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    kidsmodel.find({ isActive: true }).sort({ created: -1 })
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

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    const user_id = req.body.user_id || req.params.user_id;
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true

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
      cv: req.body.cv,
      videosAndAudios: req.body.videosAndAudios,
      features:req.body.features,
      portfolio:req.body.portfolio,
      instaFollowers: req.body.instaFollowers,
      tiktokFollowers: req.body.tiktokFollowers,
      twitterFollowers: req.body.twitterFollowers,
      youtubeFollowers: req.body.youtubeFollowers,
      facebookFollowers: req.body.facebookFollowers,
      linkedinFollowers: req.body.linkedinFollowers,
      threadsFollowers: req.body.threadsFollowers,
      idType: req.body.idType,
      verificationId: req.body.verificationId
};

    try {
      await kidsmodel.updateOne(
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
 *********kidsDataFetch*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const kidsDataFetch = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    // Check authentication
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }

    let query;
    const dataType = parseInt(req.params.dataType);
    switch (dataType) {
      case 1:
        query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
        break;
      case 2:
        query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
        break;
      case 3:
        query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
        break;
      case 4:
        query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
        break;
      default:
        return res.json({ status: false, msg: 'Invalid request' });
    }

    const response = await query;
    res.json({ status: true, data: response });
  } catch (error) {
    res.json({ status: false, msg: 'Invalid Token' });
  }
};
/**
 *********adultDataFetch*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const adultDataFetch = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    // Check authentication
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }

    let query;
    const dataType = parseInt(req.params.dataType);
    switch (dataType) {
      case 1:
        query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
        break;
      case 2:
        query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
        break;
      case 3:
        query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
        break;
      case 4:
        query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });

        break;
        case 5:
        query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
      default:
        return res.json({ status: false, msg: 'Invalid request' });
    }

    const response = await query;
    res.json({ status: true, data: response });
  } catch (error) {
    res.json({ status: false, msg: 'Invalid Token' });
  }
};
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

module.exports = {
  kidsSignUp, adultSignUp, kidsLogin, adultFetch, forgotPassword, resetPassword, editAdult, deleteUser, kidsFetch, otpVerification, subscriptionPlan,adultLogin,
  otpVerificationAdult,editKids,kidsDataFetch,adultDataFetch,otpResend,otpResendAdult,
  deleteFile

};