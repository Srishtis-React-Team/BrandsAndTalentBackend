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
const { getBusinessReviewEmailTemplate} = require('../../template.js');


const nodemailer = require('nodemailer');




var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});

const usermodel = require('../models/usermodel');

/**
 ********* Add Users******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const addUsers = async (req, res, next) => {
  try {
    console.log(req.body);

    const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);

    console.log("hashedPass", hashedPass);

    const userExist = await usermodel.findOne({ talentEmail: req.body.talentEmail });

    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }

    let newUser;

    if (req.body.age <= 17) {
      newUser = new usermodel({
        legalFirstName: req.body.legalFirstName,
        legalLastName: req.body.legalLastName,
        talentEmail: req.body.talentEmail,
        mobileNo: req.body.mobileNo,
        country: req.body.country,
        state: req.body.state,
        address: req.body.address,
        talentPassword:req.body.talentPassword,
        legalChildFirstName: req.body.legalChildFirstName,
        legalChildLastName: req.body.legalChildLastName,
        preferredFirstname: req.body.preferredFirstname,
        preferredLastName: req.body.preferredLastName,
        aboutYou:req.body.aboutYou,
        profession:req.body.profession,
        actorPerDay:req.body.actorPerDay,
        actorPerHr:req.body.actorPerHr,
        modelPerDay:req.body.modelPerDay,
        modelPerHr:req.body.modelPerHr,
        directorPerDay:req.body.directorPerDay,
        directorPerHr:req.body.directorPerHr,
        singerPerDay:req.body.singerPerDay,
        singerPerHr:req.body.singerPerHr,
        relevantCategories:req.body.relevantCategories,
        cv:req.body.cv,
        photo:req.body.photo,
        videosAndAudios:req.body.videosAndAudios,
        hairColour: req.body.hairColour,
        eyeColour: req.body.eyeColour,
        height: req.body.height,
        shoeSize: req.body.shoeSize,
        hips: req.body.hips,
        chest: req.body.chest,
        waist: req.body.waist,
        weight: req.body.weight,
        neckToToe: req.body.neckToToe,
        insideLeg: req.body.insideLeg,
        dressSize: req.body.dressSize,
        socialMedia:req.body.socialMedia,
        subscription:req.body.subscription,
        userType:'talent'
      });
    } else if (req.body.age >= 18) {
      newUser = new usermodel({
       
        talentEmail: req.body.talentEmail,
        talentPassword: hashedPass,
        userType:'talent'
      });
    }

    const response = await newUser.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
                user: host,
                pass: pass
              }
    });

    const mailOptions = {
      from: process.env.EMAIL_HOST,
      to: req.body.brandEmail,
      subject: 'Welcome to Brands&Talent',
      html: getBusinessReviewEmailTemplate()
    };

    await transporter.sendMail(mailOptions);


    return res.json({
      message: "Added Successfully",
      status: true,
      data: response,
    });

  } catch (error) {
    console.error(error);
    return res.json({
      message: "An Error Occurred",
      status: false,
    });
  }
};



/**
*********userLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const userLogin = async (req, res, next) => {
  const username = req.body.email;
  const password = req.body.password;

  try {
    const user = await usermodel.findOne({ $or: [{ email: username }, { email: username }] });

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


const userProfile = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    const user = await usermodel.findOne({ _id: userId, isActive: true });
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

    const user = await usermodel.findOne({ email: req.body.email });

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

    const user = await usermodel.findOne({
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
 *********editUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


 const editUser = async (req, res) => {
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
      actorPerDay: req.body.actorPerDay,
      actorPerHr: req.body.actorPerHr,
      modelPerDay: req.body.modelPerDay,
      modelPerHr: req.body.modelPerHr,
      directorPerDay: req.body.directorPerDay,
      directorPerHr: req.body.directorPerHr,
      singerPerDay: req.body.singerPerDay,
      singerPerHr: req.body.singerPerHr,
      relevantCategories: req.body.relevantCategories,
      legalFirstName: req.body.legalFirstName,
      legalLastName: req.body.legalLastName,
      preferredFirstname: req.body.preferredFirstname,
      preferredLastName: req.body.preferredLastName,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      nationality: req.body.nationality,
      ethnicity: req.body.ethnicity,
      dob: req.body.dob,
      languages: req.body.languages,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      country: req.body.country,
      city: req.body.city,
      aboutYou: req.body.aboutYou,
      cv: req.body.cv,
      portfolio: req.body.portfolio
    };

    try {
      await usermodel.updateOne(
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
      await usermodel.updateOne(
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
const userFetch = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
    /* Authentication */

    usermodel.find({ isActive: true }).sort({ created: -1 })
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





module.exports = {
  addUsers, userLogin, userProfile, forgotPassword, resetPassword, editUser, deleteUser, userFetch,

};