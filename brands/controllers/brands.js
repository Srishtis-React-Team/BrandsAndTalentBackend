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

const brandsmodel = require('../models/brandsmodel.js');

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const brandsRegister = async (req, res, next) => {
  try {
    console.log(req.body);

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    console.log("hashedPass", hashedPass);

    const userExist = await brandsmodel.findOne({ email: req.body.email });

    if (userExist) {
      console.log("email matches");
      return res.json({
        message: "Email ID Already Exist",
        status: false
      });
    }

    const addbrands = new brandsmodel({
      companyName: req.body.companyName,
      positionsNo: req.body.positionsNo,
      website:req.body.website,
      image:req.body.image,
      subscription:req.body.subscription,
      email: req.body.email,
      password: hashedPass,
      isActive: true
    });

    const response = await addbrands.save();

    return res.json({
      message: "Added Successfully",
      status: true,
      data: addbrands,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "An Error Occurred"
    });
  }
};

module.exports = {
    brandsRegister
  
  };