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
const usermodel = require('../../users/models/kidsmodel.js');




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
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPassword: hashedPass,
      brandPhone: req.body.brandPhone,
      brandZipCode: req.body.brandZipCode,
      enableTracking: req.body.enableTracking,
      howHearAboutAs: req.body.howHearAboutAs,
      jobTitle: req.body.jobTitle,
      jobLocation: req.body.jobLocation,
      jobAge: req.body.jobAge,
      jobGender: req.body.jobGender,
      jobSocialFollowers: req.body.jobSocialFollowers,
      jobLanguages: req.body.jobLanguages,
      jobType: req.body.jobType,
      jobRemote: req.body.jobRemote,
      jobSummary: req.body.jobSummary,
      jobYouWill: req.body.jobYouWill,
      jobIdeallyWill: req.body.jobIdeallyWill,
      jobAboutUs: req.body.jobAboutUs,
      jobBenefits: req.body.jobBenefits,
      jobPayInformation: req.body.jobPayInformation,
      jobCurrency: req.body.jobCurrency,
      jobFrequency: req.body.jobFrequency,
      jobAmountType: req.body.jobAmountType,
      jobMinPay: req.body.jobMinPay,
      jobMaxPay: req.body.jobMaxPay,
      brandImage: req.body.brandImage,
      isActive: true,
      userType: 'brand'
    };

    const newBrand = new brandsmodel(newBrandData);
    const savedBrand = await newBrand.save();

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
      // text:
      // 'Hello,\n\n' +
      // 'Your account has been successfully activated,granding you full access to our platform\n\n' +
      // 'Feel free to log in and continue exploring our platform\n\n' +

      // 'with your newly activated account.' + '\n\n' +
      // 'Login Now by clicking this link\n' +
      // 'http://13.234.177.61/project/cargators/user/resetpassword' + '\n\n'

      html: getBusinessReviewEmailTemplate()
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: true,
      message: 'An e-mail has been sent to ' + req.body.brandEmail + ' with further instructions.'
    });

  } catch (error) {
    console.error("Error during brand registration:", error);
    return res.status(500).json({
      status:false,
      message: "An error occurred during registration."
    });
  }
};
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
    const brands = await brandsmodel.findOne({ $or: [{ brandEmail: username }, { brandEmail: username }],isActive:true });
console.log("brands",brands)
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

// const login = async (req, res, next) => {
//   try {
//     const username = req.body.brandEmail;
//     const password = req.body.brandPassword;
//     const kidsEmail =req.body.kidsEmail;
//     const tpassword = req.body.talentPassword;
//     const adultEmail =req.body.adultEmail;
//     const adultpassword = req.body.talentPassword;
//     const userType = req.body.userType;
//     const type=req.body.type;
   

//     if (userType === 'talent'&&type==='kids') {
//       const user = await kidsmodel.findOne({ kidsEmail: kidsEmail ,isActive:true});

//       if (user) {
//         const passwordMatch = await bcrypt.compare(tpassword, user.talentPassword);

//         if (passwordMatch) {
//           const token = auth.gettoken(user._id, user.email);

//           return res.json({
//             status: true,
//             message: 'Login Successfully',
//             data: user,
//             token
//           });
//         } else {
//           return res.json({
//             status: false,
//             message: 'Password does not match'
//           });
//         }
//       } else {
//         return res.json({
//           status: false,
//           message: 'No Talent Found'
//         });
//       }
//     } 
//     if (userType === 'talent'&&type==='adult') {
//       const user = await adultmodel.findOne({ kidsEmail: adultEmail,isActive:true });

//       if (user) {
//         const passwordMatch = await bcrypt.compare(adultpassword, user.talentPassword);

//         if (passwordMatch) {
//           const token = auth.gettoken(user._id, user.email);

//           return res.json({
//             status: true,
//             message: 'Login Successfully',
//             data: user,
//             token
//           });
//         } else {
//           return res.json({
//             status: false,
//             message: 'Password does not match'
//           });
//         }
//       } else {
//         return res.json({
//           status: false,
//           message: 'No Talent Found'
//         });
//       }
//     } else if (userType === 'brand') {
//       const brand = await brandsmodel.findOne({ brandEmail: username,isActive:true });
//       console.log("brand",brand)
//       if (brand) {
//         const passwordMatch = await bcrypt.compare(password, brand.brandPassword);

//         if (passwordMatch) {
//           const token = auth.gettoken(brand._id, brand.brandEmail);

//           return res.json({
//             status: true,
//             message: 'Login Successfully',
//             data: brand,
//             token
//           });
//         } else {
//           return res.json({
//             status: false,
//             message: 'Password does not match'
//           });
//         }
//       } else {
//         return res.json({
//           status: false,
//           message: 'No Brand Found'
//         });
//       }
//     } else {
//       return res.json({
//         status: false,
//         message: 'Invalid UserType'
//       });
//     }
//   } catch (error) {
//     return res.json({
//       status: false,
//       message: 'Error during login'
//     });
//   }
// };
/**
 *********editBrands*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


 const editBrands = async (req, res) => {
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
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPassword: hashedPass,
      brandPhone: req.body.brandPhone,
      brandZipCode: req.body.brandZipCode,
      enableTracking: req.body.enableTracking,
      howHearAboutAs: req.body.howHearAboutAs,
      jobTitle: req.body.jobTitle,
      jobLocation: req.body.jobLocation,
      jobAge: req.body.jobAge,
      jobGender: req.body.jobGender,
      jobSocialFollowers: req.body.jobSocialFollowers,
      jobLanguages: req.body.jobLanguages,
      jobType: req.body.jobType,
      jobRemote: req.body.jobRemote,
      jobSummary: req.body.jobSummary,
      jobYouWill: req.body.jobYouWill,
      jobIdeallyWill: req.body.jobIdeallyWill,
      jobAboutUs: req.body.jobAboutUs,
      jobBenefits: req.body.jobBenefits,
      jobPayInformation: req.body.jobPayInformation,
      jobCurrency: req.body.jobCurrency,
      jobFrequency: req.body.jobFrequency,
      jobAmountType: req.body.jobAmountType,
      jobMinPay: req.body.jobMinPay,
      jobMaxPay: req.body.jobMaxPay,
      jobImage: req.body.jobImage,
      
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


const brandsProfile = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    /* Authentication */
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.json({ status: false, msg: 'Authentication failed' });
    }
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



module.exports = {
    brandsRegister,brandsLogin,editBrands,deleteBrands,brandsProfile,topBrands
  
  };