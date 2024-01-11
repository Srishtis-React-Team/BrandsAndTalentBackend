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
const imageUpload = (req, res, msg) => {
  //  res.send(req.file.filename);
  res.json({
    status: true,
    data: req.file.filename,
    message: "Success,File Uploaded...!",
  });
};
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname));
  },
});
const maxSize = 50 * 1024 * 1024;
const Fieldsize = 8 * 1024 * 1024;
var uploads = multer({
  storage: storage,
  limits: { fileSize: maxSize, fieldSize: Fieldsize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png|pdf|txt|doc|mp4|mov|avi/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
      "following filetypes - " +
      filetypes
    );
  },
});
/**
 *******listing country
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const listCountry = async (req, res, next) => {
  const { Country } = require('country-state-city');

  const countries = Country.getAllCountries();

  const countryNames = countries.map(country => country.name);

  res.json({
    status: true,
    data: countryNames
  });
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
  const { State } = require('country-state-city');

  const states = State.getAllStates();

  const stateNames = states.map(state => state.name);

  res.json({
    status: true,
    data: stateNames
  });
};//npm i country-state-city




module.exports = {
  addAdmin, adminLogin, adminProfile, forgotPassword, resetPassword, imageUpload, uploads, listCountry, listCity,listState

};