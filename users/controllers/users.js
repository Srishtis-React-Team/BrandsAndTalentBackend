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

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    console.log("hashedPass", hashedPass);

    const userExist = await usermodel.findOne({ email: req.body.email });

    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exist",
        status: false
      });
    }

    const Add_User = new usermodel({
      fullName: req.body.fullName,
      talent: req.body.talent,
      dob:req.body.dob,
      gender:req.body.gender,
      height:req.body.height,
      nationality:req.body.nationality,
      ethnicity: req.body.ethnicity,
      phone: req.body.phone,
      email: req.body.email,
      country:req.body.country,
      city:req.body.city,
      image: req.body.image,
      password: hashedPass,
      
      hairColour: req.body.hairColour,
      hairType: req.body.hairType,
      build: req.body.build,
      skinType: req.body.skinType,
      skinTone: req.body.skinTone,
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
      maritalStatus: req.body.maritalStatus,
      children: req.body.children,
      pets: req.body.pets,
      diet: req.body.diet,
      isActive: true
    });

    const response = await Add_User.save();

    return res.json({
      message: "Added Successfully",
      status: true,
      data: Add_User,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "An Error Occurred"
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

    try {
      const user_id = req.body.user_id || req.params.user_id;
      await usermodel.updateOne(
        { _id: new mongoose.Types.ObjectId(user_id) },
        { $set: { ...req.body, isActive: true } }
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




module.exports = {
  addUsers, userLogin, userProfile, forgotPassword, resetPassword, editUser, deleteUser

};