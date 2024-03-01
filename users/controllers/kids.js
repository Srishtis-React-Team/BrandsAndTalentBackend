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

    const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail,isActive:true });

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
        otp: hashedOTP, // Store hashed OTP in the user document
        bodyType:req.body.bodyType,
        industry:req.body.industry,
        isFavorite:false,
        bookJob:"25",
        rating:"4"
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
    const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail,isActive:true });
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
        type: 'adults', // Assuming type should be set to 'adult'
        otp: hashedOTP,
        isFavorite:false,
        bookJob:'30',
        rating:'3' // Store hashed OTP in the user document
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
    const user = await adultmodel.findOne({ adultEmail: newEmail,isActive:true });
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
    const user = await kidsmodel.findOne({ parentEmail: newEmail,isActive:true });
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
    await kidsmodel.findOneAndUpdate({ parentEmail: newEmail,isActive:true }, { subscriptionPlan: req.body.subscriptionPlan });


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
const talentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user, type;

    // Attempt to find the user in the adultmodel
    user = await adultmodel.findOne({ adultEmail: email, isActive: true });
    type = 'adult';

    // If not found in adultmodel, try finding in kidsmodel
    if (!user) {
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

    // Check if the provided password matches
    const isMatch = await bcrypt.compare(password, user.talentPassword);
    if (!isMatch) {
      return res.json({
        status: false,
        message: 'Password does not match'
      });
    }

    // Generate a token assuming auth.gettoken is a function to do so
    const token = auth.gettoken(user._id, email);

    // Return success response
    return res.json({
      status: true,
      message: 'Login successful',
      type: type,
      data: { user, token }
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.json({
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

    const user = await kidsmodel.findOne({ parentEmail: req.body.parentEmail,isActive:true });

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
      services:req.body.services,
      bodyType:req.body.bodyType,
      industry:req.body.industry,
      profileStatus:false
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
      verificationId: req.body.verificationId,
      reviews:req.body.reviews,
      services:req.body.services
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
    res.json({ status: false, msg: 'Error Occurred'});
  }
};
/**
 *********kidsDataFetch*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const unifiedDataFetch = async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    const type = req.params.type; // 'adult' or 'kid'
    const dataType = parseInt(req.params.dataType);

    // Check authentication
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }

    let model = type === 'kid' ? kidsmodel : adultmodel;
    let query;

    switch (dataType) {
      case 1:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
        break;
      case 2:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
        break;
      case 3:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
        break;
      case 4:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
        break;
      case 5:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
        break;
      case 6:
        query = model.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
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

//  const kidsDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }

//     let query;
//     const dataType = parseInt(req.params.dataType);
//     switch (dataType) {
//       case 1:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
//         break;
//       case 2:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//         case 5:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
//         break;
//         case 6:
//         query = kidsmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
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
// /**
//  *********adultDataFetch*****
//  * @param {*} req from user
//  * @param {*} res return data
//  * @param {*} next undefined
//  */
//  const adultDataFetch = async (req, res, next) => {
//   try {
//     const userId = req.params.user_id;

//     // Check authentication
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.json({ status: false, msg: 'Authentication failed' });
//     }

//     let query;
//     const dataType = parseInt(req.params.dataType);
//     switch (dataType) {
//       case 1:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ portfolio: 1 });
//         break;
//       case 2:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ videosAndAudios: 1 });
//         break;
//       case 3:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ cv: 1 });
//         break;
//       case 4:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ features: 1 });
//         break;
//       case 5:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ services: 1 });
//         break;
//       case 6:
//         query = adultmodel.find({ _id: userId, isActive: true }).sort({ created: -1 }).select({ reviews: 1 });
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
    const activeAdults = await adultmodel.find({ isActive: true }).select({bookJob:1,rating:1,isFavorite:1,AdultFirstName:1,city:1,location:1,image:1});

    // Find all active kids
    const activeKids = await kidsmodel.find({ isActive: true }).select({bookJob:1,rating:1,isFavorite:1,city:1,childFirstName:1,childLocation:1,image:1});

    // Combine both lists
    const allActiveUsers = [...activeAdults, ...activeKids];

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
    let filterCriteria = {
      isActive: true,
    };

    let hasFilters = false; // Flag to identify if any filters are being applied

    // Fields that can be filtered upon
    const fieldsToCheck = [
      "childCity", "instaFollowers", "tiktokFollowers", "twitterFollowers",
      "youtubeFollowers", "facebookFollowers", "linkedinFollowers", "threadsFollowers",
      "childGender", "parentCountry", "childDob", "childEthnicity", "childNationality", "languages",
      "parentFirstName", "childFirstName"
    ];

    // Check for filters in the request body and add them to the filterCriteria
    fieldsToCheck.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        hasFilters = true; // Indicates that at least one filter is applied
        if (typeof req.body[field] === 'string') {
          // Use regex for case-insensitive search for string fields
          filterCriteria[field] = { $regex: new RegExp(req.body[field], 'i') };
        } else {
          // Direct matching for non-string fields
          filterCriteria[field] = req.body[field];
        }
      }
    });

    // Special handling for "features" and "profession" filters, if provided
    if (req.body.features && req.body.features.length > 0) {
      hasFilters = true;
      filterCriteria.features = { $all: req.body.features.map(feature => ({ $elemMatch: { label: feature.label, value: feature.value } })) };
    }

    if (req.body.profession && req.body.profession.length > 0) {
      hasFilters = true;
      // Adjusting query for profession to use $in for matching any provided profession
      filterCriteria['profession.value'] = { $in: req.body.profession.map(prof => prof.value) };
    }

    // Execute the query only if there are filters set (hasFilters is true)
    let allActiveUsers = [];
    if (hasFilters) {
      // Query both models concurrently only if filters are present
      const [activeAdults, activeKids] = await Promise.all([
        adultmodel.find(filterCriteria),
        kidsmodel.find(filterCriteria)
      ]);

      allActiveUsers = [...activeAdults, ...activeKids];
    }

    // Respond with the query results
    if (allActiveUsers.length > 0) {
      res.json({ status: true, data: allActiveUsers });
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
        { AdultFirstName: new RegExp("^" + name, "i") }
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

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
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



module.exports = {
  kidsSignUp, adultSignUp, adultFetch, forgotPassword, resetPassword, updateAdults, deleteUser, kidsFetch, otpVerification, subscriptionPlan,
  otpVerificationAdult,editKids,unifiedDataFetch,otpResend,otpResendAdult,
  deleteFile,talentList,talentFilterData,setUserFavorite,talentLogin,searchTalent,checkProfileStatus,
  

};