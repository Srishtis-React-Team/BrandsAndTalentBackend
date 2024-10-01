

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
const { isValidPhoneNumber, parsePhoneNumberFromString } = require('libphonenumber-js');

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
    html: `<p>Welcome to the Brands & Talent Community!</p>
    <p>Please enter the following OTP to start creating your profile:</p>
    <p><strong>${otp}</strong></p>
    <p>For more information and helpful tips, refer to our "How it Works" and FAQs sections. If you have any questions or need further assistance, please follow and contact us through our social media handles:</p>
    <p>Facebook: <a href="https://fb.com/brandsandtalent">fb.com/brandsandtalent</a></p>
    <p>Instagram: <a href="https://instagram.com/brandsandtalent">instagram.com/brandsandtalent</a></p>
    <p>Telegram: <a href="https://t.me/brandsandtalent">https://t.me/brandsandtalent</a></p>
    <p>Email: <a href="mailto:brandsntalent@gmail.com">brandsntalent@gmail.com</a></p>
    <p>Thank you and best regards,</p>
    <p>The Brands & Talent (BT) Team</p>`
  };

  //text: `Your OTP (One-Time Password) is ${otp}. Please use this code to complete your verification process. Do not share this code with anyone. Thank you for using our services.\n\nKind regards,\nTeam`


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
const notificationmodel = require("../models/notificationmodel.js");
const contactmodel = require("../models/contactmodel.js");

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

// Utility function to validate email addresses
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const brandsRegister = async (req, res, next) => {
  try {
    console.log(req.body);
    // Email validation
    if (!validateEmail(req.body.brandEmail)) {
      return res.status(200).json({
        message: "Enter a valid email",
        status: false
      });
    }
    // It's good practice to validate confirmPassword here before proceeding.
    if (req.body.brandPassword !== req.body.confirmPassword) {
      return res.status(200).json({
        message: "Passwords do not match",
        status: false
      });
    }

    const hashedPass = await bcrypt.hash(req.body.brandPassword, 10);
    console.log("hashedPass", hashedPass);
    // Check if the email already exists in any model
    const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.brandEmail, isActive: true, inActive: true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.brandEmail, isActive: true, inActive: true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.brandEmail, isActive: true, inActive: true }).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found

    if (userExists) {
      console.log("Email matches");
      return res.json({
        message: "This Email is already registered with us.",
        status: false
      });
    }

    const newBrandData = {
      
      
      position: req.body.position,
      brandName: req.body.brandName,
      brandEmail: req.body.brandEmail,
      brandPassword: hashedPass,
      confirmPassword: hashedPass,
      planName: 'Basic',
      isActive: true,
      inActive:true,
      userType: 'brand',
      isVerified: false,
      fcmToken: req.body.fcmToken,
      brandPhone: req.body.brandPhone,
      brandZipCode: req.body.brandZipCode,
      howHearAboutAs: req.body.howHearAboutAs,
      address: req.body.address,
      logo: req.body.logo,
      brandImage: req.body.brandImage,
      fcmToken: req.body.fcmToken,
      userName: req.body.userName,
      profileImage: req.body.profileImage,
      userName: req.body.userName,
      profileImage: req.body.profileImage,
      websiteLink: req.body.websiteLink,
      publicUrl:req.body.publicUrl,
     
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
      data: req.body.brandEmail,
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
*********brands Otp verification******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const otpVerificationBrands = async (req, res, next) => {
  try {
    const { otp: inputOTP, brandEmail: email } = req.body;

    // Fetch the user from the database for the given email
    const user = await brandsmodel.findOne({ brandEmail: email, isActive: true, inActive: true });
    if (!user) {
      console.log("Error: User not found for email", email); // Log for debugging; be cautious about logging sensitive information
      return res.status(200).json({
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
        data: { brandEmail: email, brandUserId: user._id, brandName: user.brandName } // for consistency, wrap email in an object
      });
    } else {
      console.log("Error: OTP does not match for email", email); // Log for debugging
      res.status(200).json({
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



/**
*********Brands Login******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const brandsLogin = async (req, res, next) => {
  const { brandEmail, brandPassword, fcmToken } = req.body;

  try {
    const brand = await brandsmodel.findOne({brandEmail :{ $regex: new RegExp(`^${brandEmail}$`, 'i') } , isActive: true });
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
      brandImage: req.body.logo,
      address: req.body.address,
      brandImage: req.body.brandImage,
      position: req.body.position,
      publicUrl:req.body.publicUrl,
      inActive: true,
      userName: req.body.userName,
      profileImage: req.body.profileImage,
      websiteLink: req.body.websiteLink,
      publicUrl: req.body.publicUrl,
      yourFullName: req.body.yourFullName,
      brandType: req.body.brandType,
      brandCountry: req.body.brandCountry,
      brandState: req.body.brandState,
      brandCity: req.body.brandCity,
      brandWebsite: req.body.brandWebsite,
      linkedinUrl: req.body.linkedinUrl,
      facebookUrl: req.body.facebookUrl,
      twitterUrl: req.body.twitterUrl,
      aboutBrand: req.body.aboutBrand,
      whyWorkWithUs: req.body.whyWorkWithUs

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

    // /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    // /* Authentication */

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

/********** checkPublicUrl******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const checkPublicUrl = async (req, res) => {
  try {
    const name = req.body.name;
    const type = req.body.type;
    const category = req.body.category;
    if (type == 'brand') {
      // Find a brand with the specified publicUrl
      const brand = await brandsmodel.findOne({ publicUrl: name });

      if (brand) {
        // If the brand exists, return a message indicating that the name already exists
        return res.json({ status: false, msg: "Name already exists" });
      } else {
        // If the brand does not exist, return a message indicating that the name is available
        return res.json({ status: true, msg: "Name is available" });
      }
    } else if (type == 'talent') {
      if (category == 'kids') {
        const kids = await kidsmodel.findOne({ publicUrl: name });
        if (kids) {
          // If the kids exists, return a message indicating that the name already exists
          return res.json({ status: false, msg: "Name already exists" });
        } else {
          // If the kids does not exist, return a message indicating that the name is available
          return res.json({ status: true, msg: "Name is available" });
        }
      } else if (category == 'adults') {
        const adults = await adultmodel.findOne({ publicUrl: name });
        if (adults) {
          // If the adults exists, return a message indicating that the name already exists
          return res.json({ status: false, msg: "Name already exists" });
        } else {
          // If the adults does not exist, return a message indicating that the name is available
          return res.json({ status: true, msg: "Name is available" });
        }
      }
    }


  } catch (err) {
    // Handle any errors that occur during the operation
    return res.json({ status: false, msg: err.message });
  }
};


/********** recentGigs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const topBrands = async (req, res, next) => {
  try {
    const response = await brandsmodel.find({ isActive: true, inActive: true }).select({ brandImage: 1, brandName: 1 });
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
    const kidsFavorites = await kidsmodel.find({ isActive: true, isFavorite: true, inActive: true });
    // Fetch favorites from adultmodel
    const adultFavorites = await adultmodel.find({ isActive: true, isFavorite: true, inActive: true });

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
      return res.status(200).json({
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
      facebookId: req.body.facebookId,
      inActive: true,
      publicUrl: req.body.publicUrl



    };

    const newBrand = new brandsmodel(newBrandData);
    const savedBrand = await newBrand.save();


    return res.status(200).json({
      message: "Save successfully",
      status: true,
      email: req.body.brandEmail,
      user_id: newBrand._id

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
          await brandsmodel.updateOne({ brandEmail: email }, { otp: hashedOTP });
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

    const user = await brandsmodel.findOne({ brandEmail: { $regex: new RegExp(`^${req.body.brandEmail}$`, 'i') }, isActive: true });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

    await user.save();
    const resetLink = `https://brandsandtalent.com/reset-password/brand/${token}`;
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
        <p><a href="${resetLink}"><b><u>${resetLink}</u></b></a></p>

        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thanks and regards,</p>
        <p>Your HR Team</p>
       
      `
    };
    //<p><a href="${resetLink}">${resetLink}</a></p>


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


    const user = await brandsmodel.find({ isActive: true, inActive: true }).sort({ created: -1 });
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
 *  Function for Delete  notification
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.body.notificationId;

    // Find the notification based on notificationId and isActive
    const notification = await notificationmodel.findOne({ _id: notificationId, isActive: true });

    if (!notification) {
      return res.status(200).json({
        status: false,
        message: 'Notification not found or already inactive'
      });
    }

    // Update the document to set isActive to false
    const updatedNotification = await notificationmodel.findOneAndUpdate(
      { _id: notificationId },
      { isActive: false },
      { new: true } // Return the updated document
    );

    // If successful, send success response
    res.json({
      status: true,
      message: 'Deleted Successfully',
      response: updatedNotification
    });
  } catch (error) {
    // If an error occurs, send error response
    console.error("Error in deleteNotification:", error);
    res.status(500).json({
      status: false,
      message: 'An error occurred'
    });
  }
};

/**
 * updatePasswordInSettings
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const updatePasswordInSettings = async (req, res, next) => {
  try {
    const { brandId, password, newPassword } = req.body;

    if (!brandId || !password || !newPassword) {
      return res.status(200).json({ status: false, message: 'Missing required fields' });
    }

    let brand = await brandsmodel.findOne({ _id: brandId, isActive: true, inActive: true });


    const isMatch = await bcrypt.compare(password, brand.brandPassword);
    if (!isMatch) {
      return res.status(200).json({ status: false, message: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    brand.brandPassword = hashedPassword;
    brand.confirmPassword = hashedPassword;
    await brand.save();

    res.json({ status: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error in updating password:", error);
    res.status(200).json({ status: false, message: 'An error occurred' });
  }
};


/**
 *********Deactivate users*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const activateBrandUser = async (req, res) => {
  try {
    const userId = req.body.brandId || req.params.brandId;

    if (!userId) {
      return res.json({ status: false, msg: 'User ID is required' });
    }

    // Find the user in the brandsmodel
    const user = await brandsmodel.findById(userId);

    if (!user) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // Update the user's inActive status
    user.inActive = req.body.inActive;
    await user.save();

    res.json({ status: true, msg: 'Updated successfully' });
  } catch (error) {
    console.error("Error in activateBrandUser:", error);
    res.json({ status: false, msg: 'Server error' });
  }
};
/**
 *********postSupportMail users*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
// Function to save notifications to the database
const saveNotification = async (talentId, notificationMessage) => {
  try {
    // Fetch details of brand and gig
    const talent = await findUserById(talentId);
    console.log('talent', talent)

    // Create the notification document
    const notification = new notificationmodel({
      notificationType: 'Help And Support',
      notificationMessage: notificationMessage,
      talentDetails: {
        parentFirstName: talent.parentFirstName,
        parentLastName: talent.parentLastName,
        parentEmail: talent.parentEmail,
        talentId: talentId,
        email: talent.adultEmail ? talent.adultEmail : talent.parentEmail ? talent.parentEmail : talent.brandEmail,
        childFirstName: talent.childFirstName,
        childLastName: talent.childLastName,
        preferredChildFirstname: talent.preferredChildFirstname,
        preferredChildLastName: talent.preferredChildLastName,
        image: talent.image

      }
    });

    // Save the notification document
    const savedNotification = await notification.save();
    console.log("Notification saved successfully", savedNotification);
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};
// Helper function to find a user by their ID
async function findUserById(userId) {
  try {
    const brand = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
    if (brand) return brand;

    const kidTalent = await kidsmodel.findOne({ _id: userId, inActive: true, isActive: true });
    if (kidTalent) return kidTalent;

    const adultTalent = await adultmodel.findOne({ _id: userId, inActive: true, isActive: true });
    if (adultTalent) return adultTalent;

    return null;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

const postSupportMail = async (req, res, next) => {
  try {
    const { name, enquiry, phoneNo, email,subject } = req.body;

     // Check for required fields
     if (!name || !enquiry  || !email || !subject) {
      return res.json({
        status: false,
        message: 'Name, enquiry, phone number,subject, and email are required.'
      });
    }

    // Name validation
    const validateName = (name) => {
      const re = /^[A-Za-z\s]+$/;
      return re.test(name);
    };

    if (!validateName(name)) {
      return res.json({
        status: false,
        message: 'Invalid name format. Only alphabetic characters and spaces are allowed.'
      });
    }
    // Email validation
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

     
    if (!validateEmail(email)) {
      return res.json({
        status: false,
        message: 'Invalid email format.'
      });
    }

    // Search for the talentId in both kids and adult models
    let talent = await kidsmodel.findOne({ parentEmail: email });
    if (!talent) {
      talent = await adultmodel.findOne({ adultEmail: email });
    }

    const talentId = talent ? talent._id : null;



    // Save the support request details in the contact model
    const newContact = new contactmodel({
      name: name,
      enquiry: enquiry,
      phoneNo: phoneNo,
      email: email,
      talentId: talentId,
      subject:subject
     
    });

    await newContact.save();
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });

    // Define the email options
    const mailOptions = {
      from: host,
      to:['info@brandsandtalent.com', 'olin@brandsandtalent.com'],
      subject: 'Help And Support',
      html: `
        <p>Hello,</p>
        <p>We have received a new support request. Here are the details:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone Number:</strong> ${phoneNo}</p>
        <p><strong>Enquiry:</strong> ${enquiry}</p>
        <p>If you have any other questions or concerns, please don't hesitate to contact us directly.</p>
        <p>Thanks and regards,</p>
        <p>Your Support Team</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    await saveNotification(talentId, enquiry);

    res.json({
      status: true,
      message: `An e-mail has been sent to the support team with the provided details.`
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'Error during the support request process.'
    });
  }
};

/**
 *********reply users*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


// Helper function to find a user by their ID
async function findUserById(userId) {
  try {
    const brand = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
    if (brand) return brand;

    const kidTalent = await kidsmodel.findOne({ _id: userId, inActive: true, isActive: true });
    if (kidTalent) return kidTalent;

    const adultTalent = await adultmodel.findOne({ _id: userId, inActive: true, isActive: true });
    if (adultTalent) return adultTalent;

    return null;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

const contactUsReply = async (req, res, next) => {
  try {
    const { email, answer, subject, text } = req.body;

    // Find the contact request by email and get relevant fields
    const contact = await contactmodel.findOne({ email: email }).select('name enquiry phoneNo talentId');

    if (!contact) {
      return res.json({
        status: false,
        message: 'Contact request not found'
      });
    }
    const talentId = contact.talentId;
    // Update the contact document with the provided answer
    contact.answer = answer;
    contact.isRespond = true;
    contact.updatedAt = new Date();

    await contact.save();

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host, // Use environment variables for sensitive information
        pass: pass
      }
    });

    // Define the email options
    const mailOptions = {
      from: host,
      to: email,
      subject: subject,
      text: text
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    await saveNotification(talentId, answer);

    res.json({
      status: true,
      message: 'An e-mail has been sent to the user with the provided details.'
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'Error during the support request process.'
    });
  }
};

/********** contactUsList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const contactUsList = async (req, res) => {
  try {

    const contact = await contactmodel.find({ isActive: true });
    if (contact) {
      return res.json({ status: true, data: contact });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Error fetching user profile' });
  }
};

/********** deleteContact******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const deleteContact = async (req, res) => {
  const { contactId } = req.body; // Correctly extract contactId from req.body
  try {
    const contact = await contactmodel.findById(contactId);

    if (!contact) {
      return res.json({ status: false, msg: 'Contact not found' });
    }

    contact.isActive = false;
    await contact.save();

    return res.json({ status: true, msg: 'Contact deactivated successfully' });
  } catch (error) {
    return res.json({ status: false, msg: 'Error deactivating contact', error: error.message });
  }
};

/********** contactUsList per talent******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const contactUsById = async (req, res) => {
  try {

    const contact = await contactmodel.find({ isActive: true, _id: req.params.contactId });
    if (contact) {
      return res.json({ status: true, data: contact });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Error fetching user profile' });
  }
};
/**
 *********otpResend*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const otpResendBrands = async (req, res, next) => {
  try {
    const email = req.body.brandEmail;

    // Generate and hash new OTP
    const { otp, hashedOTP } = await generateAndHashOTP();

    // Compose email options
    const mailOptions = {
      from: host,
      to: email,
      subject: "Use this code to verify your account",
      html: `<p>Welcome to the Brands & Talent Community!</p>
      <p>Please enter the following OTP to start creating your profile:</p>
      <p><strong>${otp}</strong></p>
      <p>For more information and helpful tips, refer to our "How it Works" and FAQs sections. If you have any questions or need further assistance, please follow and contact us through our social media handles:</p>
      <p>Facebook: <a href="https://fb.com/brandsandtalent">fb.com/brandsandtalent</a></p>
      <p>Instagram: <a href="https://instagram.com/brandsandtalent">instagram.com/brandsandtalent</a></p>
      <p>Telegram: <a href="https://t.me/brandsandtalent">https://t.me/brandsandtalent</a></p>
      <p>Email: <a href="mailto:brandsntalent@gmail.com">brandsntalent@gmail.com</a></p>
      <p>Thank you and best regards,</p>
      <p>The Brands & Talent (BT) Team</p>`
      // text: `Your One-Time Password (OTP) is ${otp}. Please use this code to complete your verification process. Do not share this code with anyone. Thank you for using our services.\n \nKind regards,\nTeam`,
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
   
        // Update the OTP in the database for the user
        try {
          const filter = { brandEmail: email };
          const update = { otp: hashedOTP };
          await brandsmodel.findOneAndUpdate(filter, update);
          console.log("OTP updated successfully in the database");
        } catch (updateError) {
          console.error("Error updating OTP in the database:", updateError);
        }

        res.json({
          message: "OTP has been sent successfully",
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
  brandsRegister, otpVerificationBrands, brandsLogin, editBrands, deleteBrands, getBrandById, topBrands,
  favouritesList, searchDatas, socailSignUpBrands, updateBrandPassword, brandsForgotPassword, brandsResetPassword,
  getBrands, deleteNotification, updatePasswordInSettings, activateBrandUser, postSupportMail, contactUsReply,
  contactUsList, deleteContact, contactUsById, checkPublicUrl,otpResendBrands

};