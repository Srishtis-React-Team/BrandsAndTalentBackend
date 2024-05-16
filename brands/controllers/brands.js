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
     // Check if the email already exists in any model
     const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.brandEmail, isActive: true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.brandEmail, isActive: true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.brandEmail, isActive: true }).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found
    
    if (userExists) {
      console.log("Email matches");
      return res.json({
        message: "Email ID Already Exists",
        status: false
      });
    }

    // const userExist = await brandsmodel.findOne({ brandEmail: req.body.brandEmail });

    // if (userExist) {
    //   console.log("Email already exists");
    //   return res.status(400).json({
    //     message: "Email ID already exists",
    //     status: false
    //   });
    // }

    const newBrandData = {
      position:req.body.position,
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPassword: hashedPass,
      confirmPassword: hashedPass,
      planName :'Basic',
      isActive: true,
      userType: 'brand',
      isVerified: false,
      fcmToken:req.body.fcmToken
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
  const { brandEmail, brandPassword, fcmToken } = req.body;

  try {
    const brand = await brandsmodel.findOne({ brandEmail: brandEmail, isActive: true });
    console.log("Brand", brand);
    if (brand) {
      const passwordMatch = await bcrypt.compare(brandPassword, brand.brandPassword);

      if (passwordMatch) {
        // Update the fcmToken for the brand
        if (fcmToken) {
          await brandsmodel.updateOne({ _id: brand._id }, { $set: { fcmToken: fcmToken } });
        }

        const token = auth.gettoken(brand._id, brand.brandEmail);

        return res.json({
          status: true,
          message: 'Login Successfully',
          data: brand,
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
    console.error('Error during login:', error);
    return res.status(500).json({
      status: false,
      message: 'Error during login',
      error: error.toString()
    });
  }
};


// const brandsLogin = async (req, res, next) => {
//   const username = req.body.brandEmail;
//   const password = req.body.brandPassword;


//   try {
//     const brands = await brandsmodel.findOne({ $or: [{ brandEmail: username }, { brandEmail: username }], isActive: true });
//     console.log("brands", brands)
//     if (brands) {
//       const passwordMatch = await bcrypt.compare(password, brands.brandPassword);

//       if (passwordMatch) {
//         const token = auth.gettoken(brands._id, brands.brandEmail);

//         return res.json({
//           status: true,
//           message: 'Login Successfully',
//           data: brands,
//           token
//         });
//       } else {
//         return res.json({
//           status: false,
//           message: 'Password does not match'
//         });
//       }
//     } else {
//       return res.json({
//         status: false,
//         message: 'No User Found'
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

    /* Authentication */
    // You can include your authentication logic here
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    /* Authentication */

    const brand_id = req.body.user_id || req.params.user_id;
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPhone: req.body.brandPhone,
      brandZipCode: req.body.brandZipCode,
      howHearAboutAs: req.body.howHearAboutAs,
      logo: req.body.logo,
      brandImage:req.body.logo,
      address: req.body.address
      
    };

    try {
      await brandsmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(brand_id) },
        { $set: updateFields }
      );
      const responseData = { status: true, msg: 'Updated successfully', data: { brand_id, ...updateFields } };
      res.json(responseData);
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

    const user = await brandsmodel.findOne({ _id: userId, isActive: true }).sort({ created: -1 });
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
    // Fetch favorites from kidsmodel
    const kidsFavorites = await kidsmodel.find({ isActive: true, isFavorite: true });
    // Fetch favorites from adultmodel
    const adultFavorites = await adultmodel.find({ isActive: true, isFavorite: true });

    // Combine kidsFavorites and adultFavorites into a single array
    const combinedFavorites = [...kidsFavorites, ...adultFavorites];

    res.json({
      status: true,
      data: combinedFavorites // Send the combined array as the response
    });
  } catch (error) {
    console.error(error); // It's good practice to log the error for debugging purposes.
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
/**
 *********forgot password  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



 const brandsForgotPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');

    const user = await brandsmodel.findOne({ brandEmail: req.body.brandEmail, isActive: true });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

    await user.save();
    const resetLink = `https://hybrid.sicsglobal.com/project/brandsandtalent/reset-password/brand/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });
    const mailOptions = {
      from: host,
      to: req.body.brandEmail,
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
      message: 'An e-mail has been sent to ' + req.body.brandEmail + ' with further instructions.'
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


const brandsResetPassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPass);

    const user = await brandsmodel.findOne({
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
    user.brandPassword = hashedPass;

    const mailOptions = {
      from: host,
      to: user.brandEmail,
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

/********** getBrands******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const getBrands = async (req, res) => {
  try {
   

    const user = await brandsmodel.find({  isActive: true }).sort({ created: -1 });
    if (user) {
      return res.json({ status: true, data: user });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Invalid Token' });
  }
};
module.exports = {
  brandsRegister, otpVerificationBrands, brandsLogin, editBrands, deleteBrands, getBrandById, topBrands,
  favouritesList,searchDatas,socailSignUpBrands,updateBrandPassword,brandsForgotPassword,brandsResetPassword,
  getBrands

};