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
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');




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
const { brandsRegister } = require("../../brands/controllers/brands.js");
const brandsmodel = require("../../brands/models/brandsmodel.js");
const applymodel = require("../../brands/models/applymodel.js");
const notificationmodel = require("../../brands/models/notificationmodel.js");
const transactionmodel = require("../../admin/models/transactionmodel.js");

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

    // const userExist = await kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true });
    // Check if the email already exists in any model
    const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.parentEmail, isActive: true, inActive: true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.parentEmail, isActive: true, inActive: true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.parentEmail, isActive: true, inActive: true }).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found

    if (userExists) {
      console.log("Email matches");
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

      // // Generate a unique ID
      // const uniqueId = new mongoose.Types.ObjectId().toString();

      // // Use only the first 5 characters of the uniqueId
      // const shortenedUniqueId = uniqueId.slice(0, 5);

      // // Generate public URL by appending preferred child first name, last name, and shortened unique ID
      // const publicUrl = `${req.body.preferredChildFirstname}-${req.body.preferredChildLastName}-${shortenedUniqueId}`.toLowerCase().replace(/\s+/g, '-');

      // Generate public URL by appending first name, last name, and unique ID
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
        confirmPassword: hashedPass, //req.body.confirmPassword,
        profession: req.body.profession,
        relevantCategories: req.body.relevantCategories,
        childFirstName: req.body.childFirstName,
        childLastName: req.body.childLastName,
        preferredChildFirstname: req.body.preferredChildFirstname,
        preferredChildLastName: req.body.preferredChildLastName,
        preferredChildFullName:req.body.preferredChildFirstname + req.body.preferredChildLastName,
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
        otp: hashedOTP, // Store hashed OTP in the user document
        bodyType: req.body.bodyType,
        industry: req.body.industry,
        isFavorite: false,
        bookJob: "25",
        rating: "4",
        profileStatus: true,
        age: req.body.age,
        inActive: true,
        fcmToken: req.body.fcmToken,
        adminApproved: false,
        noOfJobsCompleted: req.body.noOfJobsCompleted,
        publicUrl: req.body.publicUrl,
      });
    

      // Save the new user to the database
      await newUser.save();
     

      res.json({
        message: "Half Registered Successfully",
        status: true,
        data: req.body.parentEmail,
        user_id: newUser._id
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
    // Check if the email already exists in any model
    const userExists = await Promise.any([
      kidsmodel.findOne({ parentEmail: req.body.adultEmail, isActive: true }).then(user => user || Promise.reject()),
      adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true }).then(user => user || Promise.reject()),
      brandsmodel.findOne({ brandEmail: req.body.adultEmail, isActive: true }).then(user => user || Promise.reject())
    ]).catch(() => null);  // Handling when no match is found

    if (userExists) {
      console.log("Email matches");
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
        confirmPassword: hashedPass,//req.body.confirmPassword,
        isVerified: false,
        userType: 'talent',
        isActive: true,
        type: 'adults', // Assuming type should be set to 'adult'
        otp: hashedOTP,// Store hashed OTP in the user document
        isFavorite: false,
        bookJob: '30',
        rating: '3',
        profileStatus: false,
        inActive: false,
        image: req.body.image,
        fcmToken: req.body.fcmToken,
        maritalStatus: req.body.maritalStatus,
        parentState: req.body.parentState,
        parentAddress: req.body.parentAddress,
        parentCountry: req.body.parentCountry,
        childPhone: req.body.childPhone,
        noOfJobsCompleted: req.body.noOfJobsCompleted,
        adultName: req.body.adultName,
        publicUrl: req.body.publicUrl,

      });

      // Save the new user to the database
      const response = await newUser.save();
      res.json({
        message: "OTP sent successfully",
        status: true,
        data: req.body.adultEmail, // Ensure this property exists in the request body
        id: newUser._id, // Renamed to 'userId' for clarity
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
    console.log("otp", req.body.otp)
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
      const userId = user._id; // Assuming _id is the user ID
      // Send a welcome email to the verified user
      const mailOptions = {
        from: host,
        to: newEmail,
        subject: 'Welcome to Brands&Talent',
        html: getBusinessReviewEmailTemplate(userId.toString())// getBusinessReviewEmailTemplate() // Assuming you have the email template function
      };

      await transporter.sendMail(mailOptions);

      // Generate a token, assuming auth.gettoken() is a valid method
      const token = auth.gettoken(user._id, newEmail, 'adult');

      // Return success response
      return res.json({
        status: true,
        message: 'Login successful',
        data: {
          user,
          token,
          email: newEmail,
          type: 'adult' // Returning 'adult' as the user type
        }
      });

      // console.log("Success: User verified and email sent");
      // res.json({
      //   message: "User verified",
      //   status: true,
      //   data: user._id
      // });
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
    const user = await kidsmodel.findOne({ parentEmail: newEmail, isActive: true, inActive: true });
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
        status: true,
        data: {
          parentEmail: req.body.parentEmail,
          userId: user._id // Assuming 'user' is a variable holding the user's data
        }
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


const saveNotificationPlanUpgrade = async (user_id, brandId, planName, notificationMessage) => {
  try {
    let brand;
    if (brandId) {
      brand = await findUserById(brandId);
      if (!brand) {
        throw new Error(`Brand with ID ${brandId} not found.`);
      }
    }

    const talent = await findUserById(user_id);
    if (!talent) {
      throw new Error(`Talent with ID ${user_id} not found.`);
    }

    const notification = new notificationmodel({
      notificationType: 'Talent Profile Approval',
      brandId: brandId,
      talentId: user_id,
      profileApprove: false,
      notificationMessage: notificationMessage,
      newPlan: planName,
      brandDetails: {
        _id: brand?._id,
        brandName: brand?.brandName,
        brandEmail: brand?.brandEmail,
        logo: brand?.logo,
        brandImage: brand?.brandImage,
        oldPlan: brand?.planName
      },
      talentDetails: {
        parentFirstName: talent.parentFirstName,
        parentLastName: talent.parentLastName,
        parentEmail: talent.parentEmail,
        talentId: talent._id,
        email: talent.adultEmail ? talent.adultEmail : talent.parentEmail || '',
        childFirstName: talent.childFirstName,
        childLastName: talent.childLastName,
        preferredChildFirstname: talent.preferredChildFirstname,
        preferredChildLastName: talent.preferredChildLastName,
        image: talent.image,
        oldPlan: talent.planName
      }
    });

    const savedNotification = await notification.save();
    console.log("Notification saved successfully", savedNotification);
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error; // Re-throw the error to handle it in the calling function if needed
  }
};
const subscriptionPlan = async (req, res, next) => {
  try {
    const { user_id, subscriptionPlan, planName, brand_id, transId, coupon } = req.body;//transactionDate, paymentStatus, paymentCurreny, paymentAmount, paymentPeriod, paymentPlan, 

    let UserModel;
    let nameFields;
    console.log("req.body in sub plannnnnnn",req.body)

    // Determine UserModel
    const isKid = await kidsmodel.exists({ _id: user_id });
    const isBrand = await brandsmodel.exists({ _id: brand_id || user_id });
    if (isKid) {
      UserModel = kidsmodel;
      nameFields = 'childFirstName childLastName';
    } else {

      if (isBrand) {
        UserModel = brandsmodel;
        nameFields = 'brandName';
      } else {
        UserModel = adultmodel;
        nameFields = 'firstName lastName';
      }
    }

    if (!UserModel) {
      return res.status(200).json({ status: false, message: "Invalid user model" });
    }

    // Update subscription plan for the user
    const query = { _id: user_id || brand_id };
    console.log("query", query)


    // Fetch user details
    let user = await UserModel.findOne(query);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found or email not defined" });
    }

    // Determine user email
    let userEmail = user.parentEmail || user.brandEmail || user.adultEmail;
    let senderName = user.preferredChildFirstname || user.brandName;
    if (!userEmail) {
      return res.status(200).json({ status: false, message: "Email not defined for the user" });
    }

    if (user.profileApprove === true) {

      console.log("ayytysgdfkdhbgkjfnhlkgnlhgnlkhngfnjl")
      console.log("senderName", senderName)

      // Check if the subscriptionPlan, planName, and transId are the same
      if (
        user.subscriptionPlan === subscriptionPlan &&
        user.planName === planName &&
        user.transId === transId
      ) {
        // If they match, only update the transId
        const updatedUser = await UserModel.findOneAndUpdate(
          query,
          { transId },
          { new: true }
        );
        console.log("updtaeduserrrr",updatedUser)

        if (!updatedUser) {
          return res.status(500).json({ message: "Failed to update transaction ID" });
        }
        console.log("userbrandsss--------------------------", updatedUser)
        //20-9
        // Save transaction
        const transaction = new transactionmodel({
          transId: transId,
          type: 'user',
          verifyId: updatedUser._id,
          isActive: true,
          email: userEmail,
          senderName: senderName,
          coupon: coupon
        });

        await transaction.save();

        //20-9

        return res.json({
          message: "Success: Transaction ID updated",
          status: true,
          data: updatedUser._id
        });
      } else {
        console.log("transId",transId)
        // If they don't match, update the entire subscription details
        const updatedUser = await UserModel.findOneAndUpdate(
          query,
          {
            subscriptionPlan,
            planName,
            // transactionDate,
            // paymentStatus,
            // paymentCurreny,
            // paymentAmount,
            // paymentPeriod,
            // paymentPlan,
            transId,
            accountBlock: false
          },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(500).json({ message: "Failed to update subscription plan" });
        }
        console.log("updatedUserjhfjdhgkfkgnfkjgnfhn", updatedUser)

        // Save transaction
        const transaction = new transactionmodel({
          transId: transId,
          type: 'user',
          verifyId: updatedUser._id,
          isActive: true,
          email: userEmail,
          senderName: senderName,
          coupon: coupon
        });

        await transaction.save();
        console.log("transaction", transaction._id)



        cron.schedule('0 13 * * *', async () => {
          console.log('Running subscription reminder cron job...');
          await subscriptionReminder();
        });



        return res.json({
          message: "Success: Subscription plan updated",
          status: true,
          data: updatedUser._id
        });
      }



    }//today updated code
    // } else {
    //   // Send email to admin for approval
    //   const mailOptions = {
    //     from: host,
    //     to: userEmail,
    //     subject: 'Subscription Plan Updated',
    //     html: `<p>Hi ${user.brandName || user.preferredChildFirstname},</p>
    //            <p>Your subscription plan has updated <strong>${planName}</strong>.</p>
    //            <p>Regards,</p>
    //            <p>Brands and Talent Team</p>`
    //   };

    //   transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //       console.error("Error sending email:", error);
    //       return res.status(500).json({ message: "Failed to send email", status: false });
    //     }
    //     console.log("Email sent: " + info.response);
    //   });

    //   // Save notification for admin
    //   const notificationMessage = `${isKid ? user.preferredChildFirstname : isBrand ? user.brandName : user.preferredChildFirstname} has updated their plan to ${planName}.`;
    //   await saveNotificationPlanUpgrade(user_id, brand_id, planName, notificationMessage);

    //   res.json({
    //     message: "An email has been sent to admin for approval",
    //     status: true
    //   });
    // }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred",
      status: false,
      error: error.message
    });
  }
};

// Subscription reminder function (keep this outside of the main function)
const subscriptionReminder = async () => {
  try {
    const currentDate = new Date();



    // Find users with Pro or Premium plans
    const users = await Promise.all([
      kidsmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
      adultmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
      brandsmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
    ]);

    const allUsers = [...users[0], ...users[1], ...users[2]];

    for (const user of allUsers) {

      const { transactionDate, subscriptionPlan, planName } = user;

      // Get the correct email field based on the model
      const email = user.parentEmail || user.brandEmail || user.adultEmail;

      if (!email) {
        console.log(`No email found for user: ${user._id}`);
        continue; // Skip this user if no email is found
      }
      const expirationDate = new Date(transactionDate);
      let UserModel;
      if (user.parentEmail) {
        UserModel = kidsmodel; // User is from the kids model
      } else if (user.brandEmail) {
        UserModel = brandsmodel; // User is from the brands model
      } else if (user.adultEmail) {
        UserModel = adultmodel; // User is from the adult model
      }

      //test
      // if (subscriptionPlan === 'weekly') {
      //   // Send email every time this function runs (every 5 minutes)
      //   await sendReminderEmail(email, expirationDate, 'Your weekly subscription is active. Please renew to avoid service interruption.');
      //    // Determine the correct model for account update


      //   // Block the account right after sending the email
      //   await UserModel.findByIdAndUpdate(user._id, { accountBlock: true });

      //   console.log(`Reminder email sent and account blocked for user: ${user._id}`);
      // }

      //trst



      if (subscriptionPlan === 'annual') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      } else if (subscriptionPlan === 'monthly') {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      }

      const oneWeekBefore = new Date(expirationDate);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

      const threeDaysBefore = new Date(expirationDate);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

      const oneDayBefore = new Date(expirationDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);

      if (currentDate >= oneWeekBefore && currentDate < threeDaysBefore) {
        await sendReminderEmail(email, expirationDate, 'Your account will expire in 1 week.');
      } else if (currentDate >= threeDaysBefore && currentDate < oneDayBefore) {
        await sendReminderEmail(email, expirationDate, 'Your account will expire in 3 days.');
      } else if (currentDate >= oneDayBefore && currentDate < expirationDate) {
        await sendReminderEmail(email, expirationDate, 'Your account will expire tomorrow.');
      } else if (currentDate >= expirationDate) {
        await sendReminderEmail(email, expirationDate, 'Your account has expired.');
        await UserModel.findByIdAndUpdate(user._id, { accountBlock: true });
      }
    }

    console.log('Reminder emails sent successfully.');
  } catch (error) {
    console.error('Error sending subscription reminders:', error);
  }
};

// Helper function to send reminder emails
const sendReminderEmail = async (email, expirationDate, message) => {
  const mailOptions = {
    from: host,
    to: email,
    subject: 'Subscription Reminder',
    html: `
      <p>${message}</p>
      <p>Your account will expire on: ${expirationDate.toDateString()}</p>
      <p>Please renew your subscription to continue enjoying our services.</p>
      <p>Best regards,<br/>Brands And Talent Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// const subscriptionPlan = async (req, res, next) => {
//   try {
//     const { user_id, subscriptionPlan, planName, brand_id,transactionDate,paymentStatus,paymentCurreny,paymentAmount,paymentPeriod,paymentPlan} = req.body;

//     let UserModel;
//     let nameFields;

//     // Check if user_id matches a kid
//     const isKid = await kidsmodel.exists({ _id: user_id });
//     if (isKid) {
//       UserModel = kidsmodel;
//       nameFields = 'childFirstName childLastName';
//     }

//     // Check if user_id matches a brand
//     const isBrand = await brandsmodel.exists({ _id: brand_id || user_id });
//     if (isBrand) {
//       UserModel = brandsmodel;
//       nameFields = 'brandName';
//     }

//     // If neither kid nor brand, default to adult model
//     if (!UserModel) {
//       UserModel = adultmodel;
//       nameFields = 'firstName lastName';
//     }

//     console.log("UserModel", UserModel);

//     // Update subscription plan for the user with the given user_id or brand_id
//     const query = { _id: user_id || brand_id };

//     // Define the selection to include email and additional fields based on conditions
//     let selectFields = 'email ';
//     if (isKid) {
//       selectFields += 'childFirstName childLastName';
//     } else if (isBrand) {
//       selectFields += 'brandName';
//     } else {
//       selectFields += 'firstName lastName';
//     }

//     // Fetch the user to get their email and nameFields
//     let user = await UserModel.findOne(query);
//     console.log("user", user);
//     // Check if user exists and has an email address
//     if (!user) {
//       return res.status(200).json({ message: "User not found or email not defined" });
//     }

//     // Determine the correct email field to use
//     let userEmail;
//     if (UserModel === kidsmodel) {
//       // For kids model, use parentEmail if available, otherwise use adultEmail
//       userEmail = user.parentEmail;
//     } else if (UserModel === brandsmodel) {
//       // For brands model, use brandEmail
//       userEmail = user.brandEmail;
//     } else {
//       // For adult model, use adultEmail
//       userEmail = user.adultEmail;
//     }

//     // If no valid email found, return appropriate response
//     if (!userEmail) {
//       return res.status(200).json({ message: "Email not defined for the user" });
//     }

//     if (user.profileApprove === true) {

//       // Update the subscription plan and planName
//       const updatedUser = await UserModel.findOneAndUpdate(
//         query,
//         { subscriptionPlan, planName,transactionDate,paymentStatus,paymentCurreny,paymentAmount,paymentPeriod,paymentPlan },
//         { new: true } // Options to return the updated document
//       );

//       if (!updatedUser) {
//         return res.status(200).json({ message: "Need Admin Approval" });
//       }

//       return res.json({
//         message: "Success: Subscription plan updated",
//         status: true,
//         data: updatedUser._id // Return the updated user's ID
//       });
//        // Schedule the cron job to send subscription reminders daily at 1 PM
//        const cron = require('node-cron');
//        cron.schedule('0 13 * * *', async () => {
//          console.log('Running subscription reminder cron job...');
//          await subscriptionReminder();
//        });
//       }else {
//       const mailOptions = {
//         from: host,
//         to: userEmail,
//         subject: 'Subscription Plan Updated',
//         html: `<p>Hi ${user.brandName || user.preferredChildFirstname},</p>
//              <p>Thank you for being a part of our family. Your subscription plan is updation is pending needs admin approval forthis  <strong>${planName}</strong>.</p>
//              <p>Regards,</p>
//              <p>Brands and Talent Team</p>`
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error("Error sending email:", error);
//         } else {
//           console.log("Email sent: " + info.response);
//         }
//       });
//       // Update the subscription plan and planName
//       const notificationMessage = `${isKid ? user.preferredChildFirstname : isBrand ? user.brandName : user.preferredChildFirstname} has updated their plan to ${planName}.`;

//       // Call saveNotificationPlanUpgrade to save the notification
//       await saveNotificationPlanUpgrade(user_id, brand_id,planName, notificationMessage);


//       res.json({
//         message: "A email is send to admin need approval",
//         status: true

//       });
//     }
//   } catch (error) {

//     res.status(500).json({
//       message: "An error occurred",
//       status: false,
//       error: error.message
//     });
//   }
// };
// // Subscription reminder function (keep this outside of the main function)
// const subscriptionReminder = async () => {
//   try {
//     const currentDate = new Date();

//     // Find users with Pro or Premium plans
//     const users = await Promise.all([
//       kidsmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
//       adultmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
//       brandsmodel.find({ planName: { $in: ['Pro', 'Premium'] } }),
//     ]);

//     const allUsers = [...users[0], ...users[1], ...users[2]];

//     for (const user of allUsers) {
//       const { transactionDate, subscriptionPlan, email, planName } = user;
//       const expirationDate = new Date(transactionDate);

//       if (subscriptionPlan === 'annual') {
//         expirationDate.setFullYear(expirationDate.getFullYear() + 1);
//       } else if (subscriptionPlan === 'monthly') {
//         expirationDate.setMonth(expirationDate.getMonth() + 1);
//       }

//       const oneWeekBefore = new Date(expirationDate);
//       oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

//       const threeDaysBefore = new Date(expirationDate);
//       threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

//       const oneDayBefore = new Date(expirationDate);
//       oneDayBefore.setDate(oneDayBefore.getDate() - 1);

//       if (currentDate >= oneWeekBefore && currentDate < threeDaysBefore) {
//         await sendReminderEmail(email, expirationDate, 'Your account will expire in 1 week.');
//       } else if (currentDate >= threeDaysBefore && currentDate < oneDayBefore) {
//         await sendReminderEmail(email, expirationDate, 'Your account will expire in 3 days.');
//       } else if (currentDate >= oneDayBefore && currentDate < expirationDate) {
//         await sendReminderEmail(email, expirationDate, 'Your account will expire tomorrow.');
//       } else if (currentDate >= expirationDate) {
//         await sendReminderEmail(email, expirationDate, 'Your account has expired.');
//       }
//     }
//     console.log('Reminder emails sent successfully.');
//   } catch (error) {
//     console.error('Error sending subscription reminders:', error);
//   }
// };

// // Helper function to send reminder emails
// const sendReminderEmail = async (email, expirationDate, message) => {
//   const mailOptions = {
//     from: host,
//     to: email,
//     subject: 'Subscription Reminder',
//     html: `
//       <p>${message}</p>
//       <p>Your account will expire on: ${expirationDate.toDateString()}</p>
//       <p>Please renew your subscription to continue enjoying our services.</p>
//       <p>Best regards,<br/>Brands And Talent Team</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };


/**
*********userLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const talentLogin = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  try {
    let user, type, model;


    // Attempt to find the user in the adultmodel
    user = await adultmodel.findOne({ adultEmail: { $regex: new RegExp(`^${email}$`, 'i') } });
    type = 'adult';
    model = adultmodel; // Assign the model to update the fcmToken later

    if (!user) {
      // If not found in adultmodel, try finding in kidsmodel
      user = await kidsmodel.findOne({ parentEmail: { $regex: new RegExp(`^${email}$`, 'i') } });
      type = 'kids';
      model = kidsmodel; // Update the model if user is a kid
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

    // Check if the user is active and, if a kids account, admin approved
    if (type === 'adult' && !user.isActive) {
      return res.json({
        status: false,
        message: 'User is not active'
      });
    }
    // else if (type === 'kids' && (!user.isActive || !user.adminApproved)) {
    //   return res.json({
    //     status: false,
    //     message: 'Need Approval from Admin'
    //   });
    // }

    // Update the fcmToken for the found user
    if (fcmToken) {
      await model.updateOne({ _id: user._id }, { $set: { fcmToken: fcmToken } });
    }

    // Generate a token assuming auth.gettoken is a function to do so
    const token = auth.gettoken(user._id, email, type);

    // Return success response
    return res.json({
      status: true,
      message: type === 'adult' ? 'Login successful' : 'Login successful (Kids account)',
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


/********** userprofile******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const adultFetch = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
    // /* Authentication */

    const user = await adultmodel.findById({ _id: userId, isActive: true, inActive: true, adminApproved: true });//adminApproved: true
    if (user) {
      return res.json({ status: true, data: user });
    } else {
      return res.json({ status: false, msg: 'No user found' });
    }
  } catch (error) {
    return res.json({ status: false, msg: 'Error Occured' });
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
    const { email } = req.body;

    // Initialize variables
    let user;
    let userModel;

    // Try to find the user in kidsmodel
    user = await kidsmodel.findOne({ parentEmail: email, isActive: true, inActive: true });
    if (user) {
      userModel = kidsmodel;
    } else {
      // If not found, try in adultmodel
      user = await adultmodel.findOne({ adultEmail: email, isActive: true, inActive: true });
      if (user) {
        userModel = adultmodel;
      }
    }

    // Check if user was found
    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    // Generate a token for password reset
    const token = crypto.randomBytes(20).toString('hex');

    // Set the token and its expiry in the user document
    user.resetPasswordToken = token;
    user.resetNews
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetLink = `https://brandsandtalent.com/reset-password?${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });

    const mailOptions = {
      from: host,
      to: email,
      subject: 'Password Reset',
      html: `
        <p>Hello,</p>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
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
      message: `An e-mail has been sent to ${email} with further instructions.`
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
    const { password, resetPasswordToken } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);

    // Attempt to find the user in the kids model
    let user = await kidsmodel.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: { $gt: moment(Date.now()) },
    });

    let emailField = "parentEmail"; // Default email field

    if (!user) {
      // If not found in kids model, try adult model
      user = await adultmodel.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpires: { $gt: moment(Date.now()) },
      });
      emailField = "adultEmail"; // Update email field if user is found in adult model
    }

    if (!user) {
      return res.json({
        status: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    // Update the user's password
    user.talentPassword = hashedPass;
    await user.save(); // Save the changes to the database

    // Set up email transport
    const mailOptions = {
      from: host, // Ensure this is correctly defined in your environment
      to: user[emailField], // Use dynamic email field
      subject: 'Password Reset',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account has just been changed.\n',
    };

    await transporter.sendMail(mailOptions); // Send confirmation email

    res.json({
      status: true,
      message: 'Password Changed Successfully',
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'An error occurred during the password reset.',
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
    // // Generate a unique ID
    // const uniqueId = new mongoose.Types.ObjectId().toString();

    // // Use only the first 5 characters of the uniqueId
    // const shortenedUniqueId = uniqueId.slice(0, 5);

    // // Generate public URL by appending preferred child first name, last name, and shortened unique ID
    // const publicUrl = `${req.body.preferredChildFirstname}-${req.body.preferredChildLastName}-${shortenedUniqueId}`.toLowerCase().replace(/\s+/g, '-');
    const updateFields = {
      isActive: true, // Assuming isActive is always set to true

      profession: req.body.profession,
      relevantCategories: req.body.relevantCategories,
      parentFirstName: req.body.parentFirstName,
      parentLastName: req.body.parentLastName,
      preferredChildFirstname: req.body.preferredChildFirstname,
      preferredChildLastName: req.body.preferredChildLastName,
      preferredChildFullName:req.body.preferredChildFirstname + req.body.preferredChildLastName,
      childGender: req.body.childGender,
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
      // videosAndAudios: req.body.videosAndAudios,
      features: req.body.features,
      childLocation: req.body.childLocation,
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
      services: req.body.services,
      bodyType: req.body.bodyType,
      industry: req.body.industry,
      profileStatus: false,
      image: req.body.image,
      age: req.body.age,
      inActive: true,
      maritalStatus: req.body.maritalStatus,
      parentState: req.body.parentState,
      parentAddress: req.body.parentAddress,
      parentCountry: req.body.parentCountry,
      adultLegalFirstName: req.body.adultLegalFirstName,
      adultLegalLastName: req.body.adultLegalLastName,
      reviews: req.body.reviews,
      noOfJobsCompleted: req.body.noOfJobsCompleted,
      //  videoAudioUrls: req.body.videoAudioUrls,
      videoList: req.body.videoList,
      audioList: req.body.audioList,
      publicUrl: req.body.publicUrl,
      instagramUrl: req.body.instagramUrl,
      tikTokUrl: req.body.tikTokUrl,
      youTubeUrl: req.body.youTubeUrl,
      linkedinUrl: req.body.linkedinUrl,
      facebookUrl: req.body.facebookUrl,
      threadsUrl: req.body.threadsUrl,
      twitterUrl: req.body.twitterUrl


    };

    try {
      await adultmodel.updateOne(
        { _id: new mongoose.Types.ObjectId(user_id) },
        { $set: updateFields }
      );
      const user = await adultmodel.findOne({ _id: user_id, isActive: true, inActive: true });

      // Check in the notification model if a notification for this talent already exists
      const notificationExists = await notificationmodel.findOne({
        notificationType: 'Talent Verification Approval',
        talentId: user_id
      });
      if (!notificationExists) {
        // Retrieve parentEmail and parentFirstName from the existing user document
        const adultEmail = user.adultEmail;
        const adultLegalFirstName = user.adultLegalFirstName;

        const emailContent = `
    <p>Hello ${adultLegalFirstName},</p>
    <p>You have been registered successfully. You will receive a team approval confirmation.</p>
    <p>Best regards</p>
    <p>Brands and Talent Team</p>
  `;

        const notificationMessage = `${adultLegalFirstName},has registered as a new talent. Kindly give them your approval.`;

        // Send notification and email
        await saveNotification(user_id, notificationMessage);
        if (req.body.portfolio && req.body.portfolio.length > 0) {
          console.log("portfolio.....................................")
          // Send email if skills are not present
          await sendEmail(parentEmail, 'Approval', emailContent);
        }

        // await sendEmail(adultEmail, 'Approval', emailContent);
      }

      res.json({ status: true, msg: 'Updated successfully', type: "adult", data: updateFields });
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

    // Determine the model based on the existence of the userId in kidsmodel or adultmodel
    const model = await determineUserModel(userId);

    if (!model) {
      return res.json({ status: false, msg: 'User not found' });
    }

    try {
      await model.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
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

// Function to determine the model based on userId
async function determineUserModel(userId) {
  try {
    // Check if the userId exists in kidsmodel
    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) {
      return kidsmodel;
    }

    // Check if the userId exists in adultmodel
    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) {
      return adultmodel;
    }

    // If userId does not exist in either model, return null
    return null;
  } catch (error) {
    console.error("Error determining user model:", error);
    return null;
  }
}



/**
 *********fetchUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const kidsFetch = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    kidsmodel.findOne({ _id: userId, isActive: true, inActive: true, adminApproved: true }).sort({ created: -1 })//
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
    res.json({ status: false, msg: 'Error Occured' });
  }
};

/**
 *********editUser*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


// Function to save notifications to the database
// Function to save notifications to the database
const saveNotification = async (talentId, notificationMessage) => {
  try {

    const talent = await findUserById(talentId);

    const notification = new notificationmodel({
      notificationType: 'Talent Verification Approval',
      notificationMessage: notificationMessage,
      talentId: talentId,
      talentDetails: {
        _id: talent._id,
        parentFirstName: talent.parentFirstName,
        parentLastName: talent.parentLastName,
        parentEmail: talent.parentEmail || talent.adultEmail,
        childFirstName: talent.childFirstName,
        childLastName: talent.childLastName,
        preferredChildFirstname: talent.preferredChildFirstname,
        preferredChildLastName: talent.preferredChildLastName,
        image: talent.image || req.body.image,
        verificationId: talent.verificationId,
        // Add other talent details as needed
      },
    });

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

// Helper function to determine the user type based on their ID
async function determineUserType(userId) {
  const isBrand = await brandsmodel.exists({ _id: userId });
  if (isBrand) return 'brand';

  const isKid = await kidsmodel.exists({ _id: userId });
  if (isKid) return 'kids';

  const isAdult = await adultmodel.exists({ _id: userId });
  if (isAdult) return 'adult';

  return null;
}

// Configure Nodemailer



const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: host,
    to: to,
    subject: subject,
    html: html
  };

  await transporter.sendMail(mailOptions);
};

const editKids = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;


    const user = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true });
    if (!user) {
      return res.status(200).json({ status: false, msg: 'User not found' });
    }

    // // Generate a unique ID
    // const uniqueId = new mongoose.Types.ObjectId().toString();

    // // Use only the first 5 characters of the uniqueId
    // const shortenedUniqueId = uniqueId.slice(0, 5);

    // // Check if a custom publicUrl is provided in the request body
    // let publicUrl;
    // if (req.body.publicUrl) {
    //   publicUrl = req.body.publicUrl.toLowerCase().replace(/\s+/g, '-');  // Sanitize custom publicUrl
    // } else {
    //   // Generate public URL by appending preferred child first name, last name, and shortened unique ID
    //   publicUrl = `${req.body.preferredChildFirstname}-${req.body.preferredChildLastName}-${shortenedUniqueId}`
    //     .toLowerCase()
    //     .replace(/\s+/g, '-');
    // }

    // // Generate a unique ID
    // const uniqueId = new mongoose.Types.ObjectId().toString();

    // // Use only the first 5 characters of the uniqueId
    // const shortenedUniqueId = uniqueId.slice(0, 5);

    // // Generate public URL by appending preferred child first name, last name, and shortened unique ID
    // const publicUrl = `${req.body.preferredChildFirstname}-${req.body.preferredChildLastName}-${shortenedUniqueId}`.toLowerCase().replace(/\s+/g, '-');
    // Prepare the fields to be updated
    const updateFields = {

      parentFirstName: req.body.parentFirstName,
      parentLastName: req.body.parentLastName,
      parentEmail: req.body.parentEmail,
      parentMobileNo: req.body.parentMobileNo,
      parentCountry: req.body.parentCountry,
      parentState: req.body.parentState,
      parentAddress: req.body.parentAddress,
      // confirmPassword: req.body.confirmPassword,
      profession: req.body.profession,
      relevantCategories: req.body.relevantCategories,
      childFirstName: req.body.childFirstName,
      childLastName: req.body.childLastName,
      preferredChildFirstname: req.body.preferredChildFirstname,
      preferredChildLastName: req.body.preferredChildLastName,
      preferredChildFullName:req.body.preferredChildFirstname + req.body.preferredChildLastName,
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
      // videosAndAudios: req.body.videosAndAudios,
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
      age: req.body.age,
      inActive: true,
      noOfJobsCompleted: req.body.noOfJobsCompleted,
      // videoAudioUrls: req.body.videoAudioUrls,
      videoList: req.body.videoList,
      audioList: req.body.audioList,
      publicUrl: req.body.publicUrl,
      instagramUrl: req.body.instagramUrl,
      tikTokUrl: req.body.tikTokUrl,
      youTubeUrl: req.body.youTubeUrl,
      linkedinUrl: req.body.linkedinUrl,
      facebookUrl: req.body.facebookUrl,
      threadsUrl: req.body.threadsUrl,
      twitterUrl: req.body.twitterUrl,

    };

    // Exclude fields that should not be updated directly
    delete updateFields.parentEmail;

    await kidsmodel.updateOne({ _id: userId }, { $set: updateFields });

    // Check in the notification model if a notification for this talent already exists
    const notificationExists = await notificationmodel.findOne({
      notificationType: 'Talent Verification Approval',
      talentId: userId
    });

    if (!notificationExists) {
      // Retrieve parentEmail and parentFirstName from the existing user document
      const parentEmail = user.parentEmail;
      const parentFirstName = user.parentFirstName;
      // if (!req.body.skills || req.body.skills.length === 0) {
      const emailContent = `
    <p>Hello ${parentFirstName},</p>
    <p>You have been registered successfully. You will receive a team approval confirmation.</p>
    <p>Best regards</p>
    <p>Brands and Talent Team</p>
  `;

      const notificationMessage = `${parentFirstName}, this talent is registered. Please approve them.`;

      // Send notification and email
      await saveNotification(userId, notificationMessage);
      // Check if skills are present in req.body
      if (req.body.portfolio && req.body.portfolio.length > 0) {
        console.log("portfolio.....................................")
        // Send email if skills are not present
        await sendEmail(parentEmail, 'Approval', emailContent);
      }
      //   await sendEmail(parentEmail, 'Approval', emailContent);
      //  }
    }


    res.json({
      status: true,
      msg: 'Updated successfully',
      data: {
        user_id: userId,
        // Do not directly return email for privacy reasons, or ensure it's appropriate to do so
        email: user.parentEmail,// Commented for privacy concerns; uncomment if necessary
        data:updateFields
      }
    })
    // res.json({ status: true, msg: 'Updated successfully, OTP sent to parent email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: 'Error occurred' });
  }
};

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
  //  const user = req.body.user;
    

   // if (!user || user.length === 'null') {
      let model;
      const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true
      const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true

      if (kidsUser) {
        model = kidsmodel;
      } else if (adultUser) {
        model = adultmodel;
      } else {
        return res.status(200).json({ status: false, msg: 'Need Admin Approval' });
      }

      switch (dataType) {
        case 1: {
          const user = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'portfolio').sort({ updatedAt: -1 });

          if (!user || !user.portfolio || user.portfolio.length === 0) {
            return res.status(200).json({ status: false, msg: 'Portfolio not found' });
          }
          // Reverse the portfolio and then map it to get the fileData
        
          const fileDataArray = user.portfolio.map(item => item.fileData);
          return res.json({ status: true, data: fileDataArray });
        }

        case 3: {
          const selectField = {
            3: 'cv',

          }[dataType];

          const documents = await model.findOne({ _id: objectId, isActive: true, inActive: true }).select(selectField + ' _id').sort({ updatedAt: -1 });;

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
       
        case 2: {
          try {
            // Find the document based on the given criteria
            const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
              .sort({ updatedAt: -1 })
              .select('videoList');

            if (!document || !document.videoList || document.videoList.length === 0) {
              return res.status(200).json({ status: false, msg: 'videoList data not found' });
            }

            // Directly map the URLs
            const videosAndAudiosData = document.videoList.map(videoList => videoList);

            return res.json({ status: true, videoList: videosAndAudiosData });
          } catch (error) {
            console.error('Error fetching videoList data:', error);
            return res.status(500).json({ status: false, msg: 'Internal server error' });
          }
        }

        case 4: {
          const featuresData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'features').sort({ updatedAt: -1 });;

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
            const serviceData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'services').sort({ updatedAt: -1 });

            if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
              return res.status(200).json({ status: false, msg: 'Services data not found' });
            }

            const formattedServices = serviceData.services.map(service => {
              let editorStateString = '';
              if (Array.isArray(service.editorState)) {
                editorStateString = service.editorState.join(' '); // Joining HTML strings if there are multiple
              } else if (typeof service.editorState === 'string') {
                editorStateString = service.editorState; // Use as is if it's a string
              } else {
                console.error('Unexpected type for service.editorState:', typeof service.editorState);
              }

              return {
                serviceName: service.serviceName,
                serviceAmount: service.serviceAmount,
                serviceDuration: service.serviceDuration,
                editorState: editorStateString,
                files: service.files || [], // Ensure files array exists, handle if it's undefined
              };
            });

            return res.json({ status: true, data: formattedServices });

          } catch (error) {
            console.error('Error retrieving services data:', error);
            return res.status(500).json({ status: false, msg: 'Server error' });
          }
        }
        case 7: {
          console.log("dgsgkjfkgjfnkj")
          const reviewsData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'reviews').sort({ updatedAt: -1 });
          if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
            return res.status(200).json({ status: false, msg: 'Reviews data not found' });
          }
          console.log("reviewsData", reviewsData)

          const approvedReviews = reviewsData.reviews.filter(review => review.reviewApproved === 'Approved');
          if (approvedReviews.length === 0) {
            return res.status(200).json({ status: false, msg: 'No approved reviews found' });
          }
          console.log("approvedReviews", approvedReviews)
          const formattedReviews = approvedReviews.map(review => ({
            comment: review.comment,
            starRatings: review.starRatings,
            reviewDate: review.reviewDate,
            reviewerName: review.reviewerName,
            reviewerId: review.reviewerId,
            reviewApproved: review.reviewApproved
          }));
          return res.json({ status: true, data: formattedReviews });
        }
        case 8: {
          // Find the document based on the given criteria
          const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
            .sort({ updatedAt: -1 })
            .select('audioList');

          if (!videoAudioUrlsData || !videoAudioUrlsData.audioList || videoAudioUrlsData.audioList.length === 0) {
            return res.status(200).json({ status: false, msg: 'audioList data not found' });
          }

          // Directly map the URLs
          const videoAudioUrlsDatas = videoAudioUrlsData.audioList.map(audioList => audioList);

          return res.json({ status: true, audioList: videoAudioUrlsDatas });
        }
       
        default:
          return res.status(200).json({ status: false, msg: 'No Data' });

      }
    // } else {
    //   let model;
    //   const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true
    //   const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true

    //   if (kidsUser) {
    //     model = kidsmodel;
    //   } else if (adultUser) {
    //     model = adultmodel;
    //   } else {
    //     return res.status(200).json({ status: false, msg: 'No data' });
    //   }

    //   switch (dataType) {
    //     case 1: {
    //       const user = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'portfolio').sort({ updatedAt: -1 });;

    //       if (!user || !user.portfolio || user.portfolio.length === 0) {
    //         return res.status(200).json({ status: false, msg: 'Portfolio not found' });
    //       }
    //       // Reverse the portfolio and then map it to get the fileData
    //       //  const fileDataArray = user.portfolio.reverse().map(item => item.fileData);

    //       // Transform the portfolio to the desired format
    //       const fileDataArray = user.portfolio.map(item => item.fileData);
    //       return res.json({ status: true, data: fileDataArray });
    //     }

    //     case 3: {
    //       const selectField = {
    //         3: 'cv',

    //       }[dataType];

    //       const documents = await model.findOne({ _id: objectId, isActive: true, inActive: true }).select(selectField + ' _id').sort({ updatedAt: -1 });;

    //       if (!documents || documents.length === 0 || !documents[selectField]) {
    //         return res.status(200).json({ status: false, msg: 'No data found' });
    //       }

    //       const responseData = documents[selectField].map(item => ({
    //         _id: documents._id.toString(), // Convert ObjectId to String if necessary
    //         id: item.id,
    //         title: item.title,
    //         fileData: item.fileData,
    //         type: item.type
    //       }));

    //       return res.json({ status: true, data: responseData });
    //     }
       
    //     case 2: {
    //       try {
    //         // Find the document based on the given criteria
    //         const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
    //           .sort({ updatedAt: -1 })
    //           .select('videoList');

    //         if (!document || !document.videoList || document.videoList.length === 0) {
    //           return res.status(200).json({ status: false, msg: 'videoList data not found' });
    //         }

    //         // Directly map the URLs
    //         const videosAndAudiosData = document.videoList.map(videoList => videoList);

    //         return res.json({ status: true, videoList: videosAndAudiosData });
    //       } catch (error) {
    //         console.error('Error fetching videoList data:', error);
    //         return res.status(500).json({ status: false, msg: 'Internal server error' });
    //       }
    //     }

    //     case 4: {
    //       const featuresData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'features').sort({ updatedAt: -1 });;

    //       if (!featuresData || !featuresData.features || featuresData.features.length === 0) {
    //         return res.status(200).json({ status: false, msg: 'Features data not found' });
    //       }

    //       // Format the features as per requirement
    //       const formattedFeatures = featuresData.features.map(feature => ({
    //         label: feature.label,
    //         value: feature.value
    //       }));

    //       return res.json({ status: true, data: formattedFeatures });
    //     }

    //     case 6: {
    //       try {
    //         const serviceData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'services').sort({ updatedAt: -1 });

    //         if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
    //           return res.status(200).json({ status: false, msg: 'Services data not found' });
    //         }

    //         const formattedServices = serviceData.services.map(service => {
    //           let editorStateString = '';
    //           if (Array.isArray(service.editorState)) {
    //             editorStateString = service.editorState.join(' '); // Joining HTML strings if there are multiple
    //           } else if (typeof service.editorState === 'string') {
    //             editorStateString = service.editorState; // Use as is if it's a string
    //           } else {
    //             console.error('Unexpected type for service.editorState:', typeof service.editorState);
    //           }

    //           return {
    //             serviceName: service.serviceName,
    //             serviceAmount: service.serviceAmount,
    //             serviceDuration: service.serviceDuration,
    //             editorState: editorStateString,
    //             files: service.files || [], // Ensure files array exists, handle if it's undefined
    //           };
    //         });

    //         return res.json({ status: true, data: formattedServices });

    //       } catch (error) {
    //         console.error('Error retrieving services data:', error);
    //         return res.status(500).json({ status: false, msg: 'Server error' });
    //       }
    //     }
    //     case 7: {
    //       console.log("dgsgkjfkgjfnkj")
    //       const reviewsData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'reviews').sort({ updatedAt: -1 });
    //       if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
    //         return res.status(200).json({ status: false, msg: 'Reviews data not found' });
    //       }
    //       console.log("reviewsData", reviewsData)

    //       const approvedReviews = reviewsData.reviews.filter(review => review.reviewApproved === 'Approved');
    //       if (approvedReviews.length === 0) {
    //         return res.status(200).json({ status: false, msg: 'No approved reviews found' });
    //       }
    //       console.log("approvedReviews", approvedReviews)
    //       const formattedReviews = approvedReviews.map(review => ({
    //         comment: review.comment,
    //         starRatings: review.starRatings,
    //         reviewDate: review.reviewDate,
    //         reviewerName: review.reviewerName,
    //         reviewerId: review.reviewerId,
    //         reviewApproved: review.reviewApproved
    //       }));
    //       return res.json({ status: true, data: formattedReviews });
    //     }
    //     case 8: {
    //       // Find the document based on the given criteria
    //       const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
    //         .sort({ updatedAt: -1 })
    //         .select('audioList');

    //       if (!videoAudioUrlsData || !videoAudioUrlsData.audioList || videoAudioUrlsData.audioList.length === 0) {
    //         return res.status(200).json({ status: false, msg: 'audioList data not found' });
    //       }

    //       // Directly map the URLs
    //       const videoAudioUrlsDatas = videoAudioUrlsData.audioList.map(audioList => audioList);

    //       return res.json({ status: true, audioList: videoAudioUrlsDatas });
    //     }
       
    //     default:
    //       return res.status(200).json({ status: false, msg: 'No Data' });

    //   }

    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};

// const unifiedDataFetch = async (req, res, next) => {
//   try {

//     const userId = req.params.user_id;
//     const dataType = parseInt(req.params.dataType);
//     const objectId = new mongoose.Types.ObjectId(userId);
//     const user = req.body.user;

//     if (!user || user.length === 'null') {
//       let model;
//       const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true, inActive: true, adminApproved: true });//adminApproved: true
//       const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true, inActive: true, adminApproved: true });//adminApproved: true

//       if (kidsUser) {
//         model = kidsmodel;
//       } else if (adultUser) {
//         model = adultmodel;
//       } else {
//         return res.status(200).json({ status: false, msg: 'Need Admin Approval' });
//       }

//       switch (dataType) {
//         case 1: {
//           const user = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'portfolio').sort({ updatedAt: -1 });

//           if (!user || !user.portfolio || user.portfolio.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Portfolio not found' });
//           }
//           // Reverse the portfolio and then map it to get the fileData
//           // const fileDataArray = user.portfolio.reverse().map(item => item.fileData);
//           // Transform the portfolio to the desired format
//           const fileDataArray = user.portfolio.map(item => item.fileData);
//           return res.json({ status: true, data: fileDataArray });
//         }

//         case 3: {
//           const selectField = {
//             3: 'cv',

//           }[dataType];

//           const documents = await model.findOne({ _id: objectId, isActive: true, inActive: true }).select(selectField + ' _id').sort({ updatedAt: -1 });;

//           if (!documents || documents.length === 0 || !documents[selectField]) {
//             return res.status(200).json({ status: false, msg: 'No data found' });
//           }

//           const responseData = documents[selectField].map(item => ({
//             _id: documents._id.toString(), // Convert ObjectId to String if necessary
//             id: item.id,
//             title: item.title,
//             fileData: item.fileData,
//             type: item.type
//           }));

//           return res.json({ status: true, data: responseData });
//         }
//         // case 2: {
//         //   try {
//         //     // Find the document based on the given criteria
//         //     const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//         //       .sort({ createdAt: -1 })
//         //       .select('videosAndAudios');

//         //     if (!document || !document.videosAndAudios || document.videosAndAudios.length === 0) {
//         //       return res.status(200).json({ status: false, msg: 'videosAndAudios data not found' });
//         //     }

//         //     // Directly map the URLs
//         //     const videosAndAudiosData = document.videosAndAudios.map(videosAndAudios => videosAndAudios);

//         //     return res.json({ status: true, videosAndAudios: videosAndAudiosData });
//         //   } catch (error) {
//         //     console.error('Error fetching videosAndAudios data:', error);
//         //     return res.status(500).json({ status: false, msg: 'Internal server error' });
//         //   }
//         // }
//         case 2: {
//           try {
//             // Find the document based on the given criteria
//             const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//               .sort({ updatedAt: -1 })
//               .select('videoList');

//             if (!document || !document.videoList || document.videoList.length === 0) {
//               return res.status(200).json({ status: false, msg: 'videoList data not found' });
//             }

//             // Directly map the URLs
//             const videosAndAudiosData = document.videoList.map(videoList => videoList);

//             return res.json({ status: true, videoList: videosAndAudiosData });
//           } catch (error) {
//             console.error('Error fetching videoList data:', error);
//             return res.status(500).json({ status: false, msg: 'Internal server error' });
//           }
//         }

//         case 4: {
//           const featuresData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'features').sort({ updatedAt: -1 });;

//           if (!featuresData || !featuresData.features || featuresData.features.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Features data not found' });
//           }

//           // Format the features as per requirement
//           const formattedFeatures = featuresData.features.map(feature => ({
//             label: feature.label,
//             value: feature.value
//           }));

//           return res.json({ status: true, data: formattedFeatures });
//         }

//         case 6: {
//           try {
//             const serviceData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'services').sort({ updatedAt: -1 });

//             if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
//               return res.status(200).json({ status: false, msg: 'Services data not found' });
//             }

//             const formattedServices = serviceData.services.map(service => {
//               let editorStateString = '';
//               if (Array.isArray(service.editorState)) {
//                 editorStateString = service.editorState.join(' '); // Joining HTML strings if there are multiple
//               } else if (typeof service.editorState === 'string') {
//                 editorStateString = service.editorState; // Use as is if it's a string
//               } else {
//                 console.error('Unexpected type for service.editorState:', typeof service.editorState);
//               }

//               return {
//                 serviceName: service.serviceName,
//                 serviceAmount: service.serviceAmount,
//                 serviceDuration: service.serviceDuration,
//                 editorState: editorStateString,
//                 files: service.files || [], // Ensure files array exists, handle if it's undefined
//               };
//             });

//             return res.json({ status: true, data: formattedServices });

//           } catch (error) {
//             console.error('Error retrieving services data:', error);
//             return res.status(500).json({ status: false, msg: 'Server error' });
//           }
//         }
//         case 7: {
//           console.log("dgsgkjfkgjfnkj")
//           const reviewsData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'reviews').sort({ updatedAt: -1 });
//           if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Reviews data not found' });
//           }
//           console.log("reviewsData", reviewsData)

//           const approvedReviews = reviewsData.reviews.filter(review => review.reviewApproved === 'Approved');
//           if (approvedReviews.length === 0) {
//             return res.status(200).json({ status: false, msg: 'No approved reviews found' });
//           }
//           console.log("approvedReviews", approvedReviews)
//           const formattedReviews = approvedReviews.map(review => ({
//             comment: review.comment,
//             starRatings: review.starRatings,
//             reviewDate: review.reviewDate,
//             reviewerName: review.reviewerName,
//             reviewerId: review.reviewerId,
//             reviewApproved: review.reviewApproved
//           }));
//           return res.json({ status: true, data: formattedReviews });
//         }
//         case 8: {
//           // Find the document based on the given criteria
//           const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//             .sort({ updatedAt: -1 })
//             .select('audioList');

//           if (!videoAudioUrlsData || !videoAudioUrlsData.audioList || videoAudioUrlsData.audioList.length === 0) {
//             return res.status(200).json({ status: false, msg: 'audioList data not found' });
//           }

//           // Directly map the URLs
//           const videoAudioUrlsDatas = videoAudioUrlsData.audioList.map(audioList => audioList);

//           return res.json({ status: true, audioList: videoAudioUrlsDatas });
//         }
//         // case 8: {
//         //   // Find the document based on the given criteria
//         //   const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//         //     .sort({ createdAt: -1 })
//         //     .select('videoAudioUrls');

//         //   if (!videoAudioUrlsData || !videoAudioUrlsData.videoAudioUrls || videoAudioUrlsData.videoAudioUrls.length === 0) {
//         //     return res.status(200).json({ status: false, msg: 'videoAudioUrls data not found' });
//         //   }

//         //   // Directly map the URLs
//         //   const videoAudioUrlsDatas = videoAudioUrlsData.videoAudioUrls.map(videoAudioUrl => videoAudioUrl);

//         //   return res.json({ status: true, videoAudioUrls: videoAudioUrlsDatas });
//         // }
//         default:
//           return res.status(200).json({ status: false, msg: 'No Data' });

//       }
//     } else {
//       let model;
//       const kidsUser = await kidsmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true
//       const adultUser = await adultmodel.findOne({ _id: objectId, isActive: true, inActive: true });//adminApproved: true

//       if (kidsUser) {
//         model = kidsmodel;
//       } else if (adultUser) {
//         model = adultmodel;
//       } else {
//         return res.status(200).json({ status: false, msg: 'No data' });
//       }

//       switch (dataType) {
//         case 1: {
//           const user = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'portfolio').sort({ updatedAt: -1 });;

//           if (!user || !user.portfolio || user.portfolio.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Portfolio not found' });
//           }
//           // Reverse the portfolio and then map it to get the fileData
//           //  const fileDataArray = user.portfolio.reverse().map(item => item.fileData);

//           // Transform the portfolio to the desired format
//           const fileDataArray = user.portfolio.map(item => item.fileData);
//           return res.json({ status: true, data: fileDataArray });
//         }

//         case 3: {
//           const selectField = {
//             3: 'cv',

//           }[dataType];

//           const documents = await model.findOne({ _id: objectId, isActive: true, inActive: true }).select(selectField + ' _id').sort({ updatedAt: -1 });;

//           if (!documents || documents.length === 0 || !documents[selectField]) {
//             return res.status(200).json({ status: false, msg: 'No data found' });
//           }

//           const responseData = documents[selectField].map(item => ({
//             _id: documents._id.toString(), // Convert ObjectId to String if necessary
//             id: item.id,
//             title: item.title,
//             fileData: item.fileData,
//             type: item.type
//           }));

//           return res.json({ status: true, data: responseData });
//         }
//         // case 2: {
//         //   try {
//         //     // Find the document based on the given criteria
//         //     const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//         //       .sort({ createdAt: -1 })
//         //       .select('videosAndAudios');

//         //     if (!document || !document.videosAndAudios || document.videosAndAudios.length === 0) {
//         //       return res.status(200).json({ status: false, msg: 'videosAndAudios data not found' });
//         //     }

//         //     // Directly map the URLs
//         //     const videosAndAudiosData = document.videosAndAudios.map(videosAndAudios => videosAndAudios);

//         //     return res.json({ status: true, videosAndAudios: videosAndAudiosData });
//         //   } catch (error) {
//         //     console.error('Error fetching videosAndAudios data:', error);
//         //     return res.status(500).json({ status: false, msg: 'Internal server error' });
//         //   }
//         // }
//         case 2: {
//           try {
//             // Find the document based on the given criteria
//             const document = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//               .sort({ updatedAt: -1 })
//               .select('videoList');

//             if (!document || !document.videoList || document.videoList.length === 0) {
//               return res.status(200).json({ status: false, msg: 'videoList data not found' });
//             }

//             // Directly map the URLs
//             const videosAndAudiosData = document.videoList.map(videoList => videoList);

//             return res.json({ status: true, videoList: videosAndAudiosData });
//           } catch (error) {
//             console.error('Error fetching videoList data:', error);
//             return res.status(500).json({ status: false, msg: 'Internal server error' });
//           }
//         }

//         case 4: {
//           const featuresData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'features').sort({ updatedAt: -1 });;

//           if (!featuresData || !featuresData.features || featuresData.features.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Features data not found' });
//           }

//           // Format the features as per requirement
//           const formattedFeatures = featuresData.features.map(feature => ({
//             label: feature.label,
//             value: feature.value
//           }));

//           return res.json({ status: true, data: formattedFeatures });
//         }

//         case 6: {
//           try {
//             const serviceData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'services').sort({ updatedAt: -1 });

//             if (!serviceData || !serviceData.services || serviceData.services.length === 0) {
//               return res.status(200).json({ status: false, msg: 'Services data not found' });
//             }

//             const formattedServices = serviceData.services.map(service => {
//               let editorStateString = '';
//               if (Array.isArray(service.editorState)) {
//                 editorStateString = service.editorState.join(' '); // Joining HTML strings if there are multiple
//               } else if (typeof service.editorState === 'string') {
//                 editorStateString = service.editorState; // Use as is if it's a string
//               } else {
//                 console.error('Unexpected type for service.editorState:', typeof service.editorState);
//               }

//               return {
//                 serviceName: service.serviceName,
//                 serviceAmount: service.serviceAmount,
//                 serviceDuration: service.serviceDuration,
//                 editorState: editorStateString,
//                 files: service.files || [], // Ensure files array exists, handle if it's undefined
//               };
//             });

//             return res.json({ status: true, data: formattedServices });

//           } catch (error) {
//             console.error('Error retrieving services data:', error);
//             return res.status(500).json({ status: false, msg: 'Server error' });
//           }
//         }
//         case 7: {
//           console.log("dgsgkjfkgjfnkj")
//           const reviewsData = await model.findOne({ _id: objectId, isActive: true, inActive: true }, 'reviews').sort({ updatedAt: -1 });
//           if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
//             return res.status(200).json({ status: false, msg: 'Reviews data not found' });
//           }
//           console.log("reviewsData", reviewsData)

//           const approvedReviews = reviewsData.reviews.filter(review => review.reviewApproved === 'Approved');
//           if (approvedReviews.length === 0) {
//             return res.status(200).json({ status: false, msg: 'No approved reviews found' });
//           }
//           console.log("approvedReviews", approvedReviews)
//           const formattedReviews = approvedReviews.map(review => ({
//             comment: review.comment,
//             starRatings: review.starRatings,
//             reviewDate: review.reviewDate,
//             reviewerName: review.reviewerName,
//             reviewerId: review.reviewerId,
//             reviewApproved: review.reviewApproved
//           }));
//           return res.json({ status: true, data: formattedReviews });
//         }
//         case 8: {
//           // Find the document based on the given criteria
//           const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//             .sort({ updatedAt: -1 })
//             .select('audioList');

//           if (!videoAudioUrlsData || !videoAudioUrlsData.audioList || videoAudioUrlsData.audioList.length === 0) {
//             return res.status(200).json({ status: false, msg: 'audioList data not found' });
//           }

//           // Directly map the URLs
//           const videoAudioUrlsDatas = videoAudioUrlsData.audioList.map(audioList => audioList);

//           return res.json({ status: true, audioList: videoAudioUrlsDatas });
//         }
//         // case 8: {
//         //   // Find the document based on the given criteria
//         //   const videoAudioUrlsData = await model.findOne({ _id: objectId, isActive: true, inActive: true })
//         //     .sort({ createdAt: -1 })
//         //     .select('videoAudioUrls');

//         //   if (!videoAudioUrlsData || !videoAudioUrlsData.videoAudioUrls || videoAudioUrlsData.videoAudioUrls.length === 0) {
//         //     return res.status(200).json({ status: false, msg: 'videoAudioUrls data not found' });
//         //   }

//         //   // Directly map the URLs
//         //   const videoAudioUrlsDatas = videoAudioUrlsData.videoAudioUrls.map(videoAudioUrl => videoAudioUrl);

//         //   return res.json({ status: true, videoAudioUrls: videoAudioUrlsDatas });
//         // }
//         default:
//           return res.status(200).json({ status: false, msg: 'No Data' });

//       }

//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
//   }
// };

/*
 *********file delete*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteFile = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const elementIdToRemove = req.body.element_id; // The ID of the element to remove

    // Function to update the user document by removing items from arrays
    const updateUserDocument = async (model) => {
      return await model.findOneAndUpdate(
        { _id: userId },
        {
          $pull: {
            cv: { id: elementIdToRemove },
            videosAndAudios: { id: elementIdToRemove },
            portfolio: { id: elementIdToRemove }
          }
        },
        { new: true } // To return the updated document
      );
    };

    // Try to update the document in kidsmodel
    let updatedUser = await updateUserDocument(kidsmodel);
    let userType = 'kids';

    // If not found in kidsmodel, try in adultmodel
    if (!updatedUser) {
      updatedUser = await updateUserDocument(adultmodel);
      userType = 'adult';
    }

    if (updatedUser) {

      res.json({ status: true, msg: `Items successfully removed from ${userType} model.`, updatedUser });
    } else {

      res.json({ status: false, msg: 'No items were removed.', updatedUser: null });
    }
  } catch (error) {

    res.json({ status: false, msg: 'Internal server error.' });
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
          const filter = { parentEmail: email };
          const update = { otp: hashedOTP };
          await kidsmodel.findOneAndUpdate(filter, update);
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
/**
 *********talentList*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const talentList = async (req, res) => {
  try {
    // Find all active adults
    const activeAdults = await adultmodel.find({ isActive: true,adminApproved: true }); // adminApproved: true

    // Find all active kids
    const activeKids = await kidsmodel.find({ isActive: true, inActive: true,adminApproved: true}); // adminApproved: true

    // Combine both lists
    let allActiveUsers = [...activeAdults, ...activeKids];

    // Sort the combined list by createdAt in descending order
    allActiveUsers = allActiveUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Reverse the sorted array
    allActiveUsers = allActiveUsers;

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
//     const activeAdults = await adultmodel.find({ isActive: true });//adminApproved: true

//     // Find all active kids
//     const activeKids = await kidsmodel.find({ isActive: true, inActive: true });//adminApproved: true

//     // Combine both lists
//    // const reversedUsers = [...activeAdults, ...activeKids];
//    // Combine both lists without reversing
//    const allActiveUsers = [...activeAdults, ...activeKids];

//     // Reverse the array
//     //const allActiveUsers = reversedUsers.reverse();

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
    let orSocialConditions = [];


       // Helper function to add regex condition
       const addRegexCondition = (field, value) => {
        if (value) {
          orConditions.push({ [field]: { $regex: new RegExp(escapeRegex(value), 'i') } });
        }
      };

    // //  // Profession filter
    if (req.body.profession && req.body.profession.length) {
      const professionValues = req.body.profession.map(prof => prof.value);
      orConditions.push({ 'profession.value': { $in: professionValues } });
    }
    // Profession filter


    // Features filter
    if (req.body.features && req.body.features.length) {
      req.body.features.forEach(feature => {
        let condition = { features: { $elemMatch: { label: feature.label, value: feature.value } } };
        orConditions.push(condition);
      });
    }
   
    //height
    // Height filter within features
    
    if (req.body.height) {
      orConditions.push({ features: { $elemMatch: { label: "Height", value: req.body.height } } });
     
    }
    

    // Age range filter
    if (req.body.minAge && req.body.maxAge) {
      const minAge = parseInt(req.body.minAge);
      const maxAge = parseInt(req.body.maxAge);
      orConditions.push({ age: { $gte: minAge, $lte: maxAge } });
    }

    // Generic string fields handling
    const fields = ['adultEmail', 'contactEmail', 'country', 'parentFirstName', 'parentLastName',
      'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState',
      'parentAddress', 'profession.value', 'profession.label',
      'relevantCategories', 'industry', 'childFirstName',
      'childLastName', 'preferredChildFirstname', 'preferredChildLastName',
      'childEthnicity', 'childPhone', 'childEmail', 'childLocation',
      'childCity', 'childAboutYou', 'services', 'portfolio',
      'features.label', 'features.value', 'maritalStatus'];

    fields.forEach(field => {
      addRegexCondition(field, req.body[field]);
    });
    // // Generic string fields handling (case insensitive)
    // const fields = ['adultEmail', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childEthnicity', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['childCity', 'parentCountry','childNationality', 'gender', 'childEthnicity', 'languages', 'childFirstName', 'parentFirstName', 'industry','preferredChildFirstname', 'preferredChildLastName'];
    // fields.forEach(field => {
    //   if (req.body[field]) {
    //     let condition = {};
    //     condition[field] = { $regex: new RegExp(req.body[field], 'i') }; // Case-insensitive search
    //     orConditions.push(condition);
    //   }
    // });

    // Search term filter
    if (req.body.searchTerm) {
      const searchTerm = req.body.searchTerm;
      const searchFields = ['adultEmail', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childEthnicity', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['adultEmail','childNationality', 'gender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const searchTermConditions = searchFields.map(field => ({ [field]: { $regex: new RegExp(searchTerm, 'i') } }));
      orConditions.push(...searchTermConditions);
    }

    // Selected terms filter
    if (req.body.selectedTerms) {
      const selectedTerms = req.body.selectedTerms;
      const selectedTermsFields = ['adultEmail', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label', 'relevantCategories', 'industry', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childEthnicity', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus']//['adultEmail','childNationality', 'gender', 'childGender', 'contactEmail', 'country', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentMobileNo', 'parentCountry', 'parentState', 'parentAddress', 'profession.value', 'profession.label','industry', 'relevantCategories', 'childFirstName', 'childLastName', 'preferredChildFirstname', 'preferredChildLastName', 'childGender', 'childNationality', 'childEthnicity', 'languages', 'childPhone', 'childEmail', 'childLocation', 'childCity', 'childAboutYou', 'services', 'portfolio', 'features.label', 'features.value', 'maritalStatus'];
      const selectedTermsConditions = selectedTermsFields.map(field => ({ [field]: { $regex: new RegExp(selectedTerms, 'i') } }));
      orConditions.push(...selectedTermsConditions);
    }

    // Gender filter
    if (req.body.childGender) {
      let genderConditions = [];

      if (req.body.childGender) {
        genderConditions.push({ childGender: req.body.childGender });
      }
      orConditions.push({ $or: genderConditions });
    }

    // Array-based filters
    if (req.body.childNationality && req.body.childNationality.length > 0) {
      orConditions.push({ childNationality: { $in: req.body.childNationality } });
    }

    if (req.body.languages && req.body.languages.length > 0) {
      orConditions.push({ languages: { $in: req.body.languages } });
    }
    //newly 
    // Social media filter
 // Social media filter
  // Social media filter
  if (req.body.socialmedia) {
    const socialMediaPlatforms = req.body.socialmedia || [];
    const minfollowerscount = parseInt(req.body.minfollowerscount, 10) || 0;
    const maxfollowerscount = parseInt(req.body.maxfollowerscount, 10) || Infinity;

    const createFollowerCondition = (field) => ({
      $expr: {
        $and: [
          {
            $gte: [
              { $convert: { input: `$${field}`, to: "int", onError: 0, onNull: 0 } },
              minfollowerscount
            ]
          },
          {
            $lte: [
              { $convert: { input: `$${field}`, to: "int", onError: 0, onNull: 0 } },
              maxfollowerscount
            ]
          }
        ]
      }
    });

    // Add conditions for each social media platform
    const socialPlatforms = ['facebook', 'instagram', 'linkedin', 'threads', 'tiktok', 'twitter', 'youtube'];
    socialPlatforms.forEach(platform => {
      if (socialMediaPlatforms.includes(platform)) {
        orSocialConditions.push(createFollowerCondition(`${platform}Followers`));
      }
    });
  }
    //newly


if (req.body.name) {
  const name = req.body.name.trim();
  const escapedKeyword = escapeRegex(name); // Function to escape regex special characters

  // Define the keyword conditions for first and last names
  const keywordConditions = [
    { preferredChildFirstname: { $regex: new RegExp(escapedKeyword, 'i') } },
    { preferredChildLastName: { $regex: new RegExp(escapedKeyword, 'i') } },
    { preferredChildFullName: { $regex: new RegExp(escapedKeyword, 'i') } } // Check against full name field
  ];

  // Push the keyword conditions into orConditions
  orConditions.push({ $or: keywordConditions });
}


    // Keyword filter (checking in both adult and kids models)
    if (req.body.keyword) {
      const keyword = req.body.keyword.trim();
      const escapedKeyword = escapeRegex(keyword); // Function to escape regex special characters

      const keywordConditions = [
        { 'adultEmail': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentEmail': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childEmail': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'contactEmail': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'country': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentFirstName': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentLastName': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentMobileNo': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentCountry': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentState': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'parentAddress': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'profession.value': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'profession.label': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'relevantCategories': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'industry': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childFirstName': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childLastName': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'preferredChildFirstname': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'preferredChildLastname': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childEthnicity': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childPhone': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childLocation': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childCity': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'childAboutYou': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'services': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'portfolio': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'features.label': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'features.value': { $regex: new RegExp(escapedKeyword, 'i') } },
        { 'maritalStatus': { $regex: new RegExp(escapedKeyword, 'i') } }
        // Add more conditions as needed for other fields
      ];
      orConditions.push({ $or: keywordConditions });
    }


    console.log("orConditions", orConditions)
    // Add conditions for isActive: true and inActive: true
    orConditions.push({ isActive: true }, { inActive: true });//,{adminApproved: true}

    // Constructing the final query with all conditions
     // Construct the final query
     
    //let query = orConditions.length ? { $and: orConditions || socailquery } : {};

    let query = {};
   

    if (orConditions.length > 0) {
      query = { $and: orConditions };
    }

    if (orSocialConditions.length > 0) {
      query.$and.push({ $or: orSocialConditions });
    }


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
  //   // Function to escape regex special characters
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
    const user = req.body.user
    const type = req.body.type; // Assuming this is passed in the request to distinguish between 'kid' and 'adult'

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
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
        { _id: new mongoose.Types.ObjectId(user) },
        { $set: { isFavorite: true } }
      );
      res.json({ status: true, msg: 'Set as favorite successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  }
  catch (error) {
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
    const adultUser = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId), isActive: true })
    if (adultUser.inActive == false) {
      userType = 'adults';
      profileStatus = false;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }
    else {
      userType = 'adults';
      profileStatus = true;
      return res.json({ status: true, msg: 'Profile status retrieved successfully', type: userType, profileStatus: profileStatus });
    }



  } catch (error) {
    console.error('Error checking profile status:', error);
    return res.json({ status: false, msg: 'Error occurred during profile status check', error: error.message });
  }
};



/**
 *********getTalentById*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const getTalentById = async (req, res, next) => {
  try {
    const userId = req.params.user_id;


    let model;
    // Assuming kidsmodel and adultmodel are correctly imported and utilized
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true });//,adminApproved: true
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true });//,adminApproved: true

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(200).json({ status: false, msg: 'User not found or not active' });
    }

    // Query the model to get details of the user
    const userDetails = await model.findOne({ _id: userId, isActive: true });

    if (!userDetails) {
      return res.status(200).json({ status: false, msg: 'User details not found' });
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
      // Fetch updated user data
      if (updateResult.modifiedCount > 0) {
        updatedUserData = await adultmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      }
    } else {
      // If not found in adultmodel, check in kidsmodel
      const kidUser = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (kidUser) {
        userType = 'kids';
        updateResult = await kidsmodel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { profileStatus: true } }
        );
        // Fetch updated user data
        if (updateResult.modifiedCount > 0) {
          updatedUserData = await kidsmodel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        }
      }
    }

    // If user type is still empty, user was not found in either model
    if (!userType) {
      return res.json({ status: false, msg: 'User not found' });
    }

    // // If we have an update result, we successfully updated the profile status
    // if (updateResult) {
    //   return res.json({ status: true, msg: 'Set profile status successfully', type: userType,data:updateResult });
    // } 
    if (updateResult && updatedUserData) {
      return res.json({
        status: true,
        msg: 'Set profile status successfully',
        type: userType,
        data: updatedUserData
      });
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
    const kidsUser = await kidsmodel.findOne({ parentEmail: email, isActive: true, inActive: true });
    const adultUser = await adultmodel.findOne({ adultEmail: email, isActive: true, inActive: true });
    const brandUser = await brandsmodel.findOne({ brandEmail: email, isActive: true, inActive: true });
    // Determine which model the user is in
    if (kidsUser) {
      model = kidsmodel;
      user = kidsUser;
    } else if (adultUser) {
      model = adultmodel;
      user = adultUser;
    } else if (brandUser) {
      model = brandsmodel;
      user = brandUser;
    }
    else {
      return res.status(200).json({ status: false, msg: 'User not found or not active' });
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
      <p>Thank you for signing up for the Brands & Talent newsletter! You will be the first to know about latest news, updates and amazing offers. Stay tuned.</p>
       <p>Best regards,</p>
       <p>Brands And Talent Team</p>
    
    `,

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
/**
 *********logintemplate*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const loginTemplate = async (req, res) => {
  try {
    const { parentEmail } = req.body;

    // Ensure email is provided
    if (!parentEmail) {
      return res.status(400).json({
        message: "Parent email is required",
        status: false
      });
    }

    // Update isVerified value to true for the user with the given email
    const updatedUser = await kidsmodel.findOneAndUpdate(
      { parentEmail: parentEmail, isActive: true, inActive: true },
      { $set: { isVerified: true } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(200).json({
        message: "User not found or already verified",
        status: false
      });
    }
    const userId = updatedUser._id; // Assuming _id is the user ID
    const mailOptions = {
      from: host,
      to: parentEmail, // Use the parentEmail from req.body
      subject: 'Welcome to Brands&Talent',
      html: getBusinessReviewEmailTemplate(userId.toString())//getBusinessReviewEmailTemplate() // Assuming this function returns your email template's HTML
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "User verified and email sent",
      status: true
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred",
      status: false,
      error: error.toString()
    });
  }
};
/**
********getPlanByType******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getPlanByType = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    /* Authentication (Uncomment and adjust as necessary)
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.status(401).json({ status: false, msg: 'Authentication failed' });
    }
    */

    let plan = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true }).populate('subscriptionId');

    if (!plan) {
      plan = await adultmodel.findOne({ _id: userId, isActive: true, inActive: true }).populate('subscriptionId');
    }

    if (!plan) {
      return res.status(200).json({
        status: false,
        message: 'Plan not found'
      });
    }

    res.json({
      status: true,
      data: plan
    });

  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      status: false,
      message: 'Server error'
    });
  }
};
/**
 *********remove favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const removeFavorite = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;
    const user = req.body.user
    const type = req.body.type; // Assuming this is passed in the request to distinguish between 'kid' and 'adult'

    /* Authentication */
    // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    // if (!authResult) {
    //   return res.json({ status: false, msg: 'Authentication failed' });
    // }
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
        { _id: new mongoose.Types.ObjectId(user) },
        { $set: { isFavorite: false } }
      );
      res.json({ status: true, msg: 'Remove favorite successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
    // } catch (error) {
    //   res.json({ status: false, msg: 'Invalid Token' });
    // }
  } catch (error) {
    res.json({ status: false, msg: error.message });
  }
};
/**
 *********remove favourtites*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const checkUserStatus = async (req, res, next) => {
  try {
    const userId = req.body.user_id;

    let model;

    // Assuming kidsmodel and adultmodel are correctly imported and utilized
    const kidsUser = await kidsmodel.findById({ _id: userId, isActive: true, inActive: true });//,adminApproved: true
    const adultUser = await adultmodel.findById({ _id: userId, isActive: true, inActive: true });//adminApproved: true

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else {
      return res.status(200).json({ status: false, msg: 'New user' });
    }

    // Query the model to get details of the user
    const userDetails = await model.findById({ _id: userId, isActive: true });

    if (!userDetails) {
      return res.json({ status: false, msg: 'New user' });
    }

    res.json({ status: true, data: userDetails, msg: 'This user is already exist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};
/**
*********google Sign up******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const socialSignup = async (req, res, next) => {
  try {
    // Check if the user already exists
    const userExist = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true, inActive: true });


    // Create a new user document
    const newUser = new adultmodel({
      adultEmail: req.body.adultEmail,
      googleId: req.body.googleId,
      provider: req.body.provider,
      isVerified: false,
      userType: 'talent',
      isActive: true,
      type: 'adults',
      isFavorite: false,
      profileStatus: false,
      facebookId: req.body.facebookId,
      inActive: true,
      image: req.body.image,
      adminApproved: false,
      publicUrl: req.body.publicUrl

    });

    // Save the new user to the database
    const response = await newUser.save();

    res.json({
      message: "Save successfully",
      status: true,
      email: req.body.adultEmail,
      user_id: newUser._id
    });

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
********editPassword******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const updateAdultPassword = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;


    const hashedPass = await bcrypt.hash(req.body.talentPassword, 10);

    const updateResult = await adultmodel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { inActive: true, isActive: true, talentPassword: hashedPass } }
    );

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

        console.log("Email sent: " + info.response);

        // Update the OTP in the database for the user
        try {
          const filter = { adultEmail: email };
          const update = { otp: hashedOTP };
          await adultmodel.updateOne(filter, update);

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
 *********Adult forgot password  ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



const adultForgotPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');

    const user = await adultmodel.findOne({ adultEmail: req.body.adultEmail, isActive: true });

    if (!user) {
      return res.json({
        status: false,
        message: 'No account with that email address exists.'
      });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = moment(Date.now()) + 3600000;

    await user.save();
    const resetLink = `https://brandsandtalent.com/reset-password/adult/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: host,
        pass: pass
      }
    });
    const mailOptions = {
      from: host,
      to: req.body.adultEmail,
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
    // <p><a href="${resetLink}">${resetLink}</a></p>

    await transporter.sendMail(mailOptions);

    res.json({
      status: true,
      message: 'An e-mail has been sent to ' + req.body.adultEmail + ' with further instructions.'
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
 *********adult resetPassword ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */


const adultResetPassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPass);

    const user = await adultmodel.findOne({
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
      to: user.adultEmail,
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
 *********fetchUserData ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const fetchUserData = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // Check if the userId exists in adultmodel
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true, inActive: true, adminApproved: true });//adminApproved: true
    if (adultUser) {
      return res.json({ status: true, data: adultUser });
    }

    // Check if the userId exists in kidsmodel
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true, adminApproved: true });//,adminApproved: true
    if (kidsUser) {
      return res.json({ status: true, data: kidsUser });
    }
    // Check if the userId exists in kidsmodel
    const brandUser = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
    if (brandUser) {
      return res.json({ status: true, data: brandUser });
    }

    // If userId is not found in either model, return appropriate response
    return res.json({ status: false, msg: 'No user found' });
  } catch (error) {
    return res.json({ status: false, msg: 'Error Occurred' });
  }
};
/**
 *********count brands, talents ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const countUsers = async (req, res) => {
  try {
    // Count active users in adultmodel
    const adultUserCount = await adultmodel.countDocuments({ isActive: true, inActive: true, adminApproved: true });//,adminApproved: true 

    // Count active users in kidsmodel
    const kidsUserCount = await kidsmodel.countDocuments({ isActive: true, inActive: true, adminApproved: true });//,adminApproved: true

    // Count active users in brandsmodel
    const brandUserCount = await brandsmodel.countDocuments({ isActive: true, inActive: true });

    // Calculate talent count (sum of adult and kids users)
    const talentCount = adultUserCount + kidsUserCount;

    // Calculate all users count (sum of talent count and brand users)
    const allUsersCount = talentCount + brandUserCount;

    // Create the array with the counts
    const userCounts = [
      { type: 'adultUserCount', count: adultUserCount },
      { type: 'kidsUserCount', count: kidsUserCount },
      { type: 'brandUserCount', count: brandUserCount },
      { type: 'talentCount', count: talentCount },
      { type: 'allUsersCount', count: allUsersCount }
    ];

    // Return the counts in the response
    return res.json({
      status: true,
      data: userCounts
    });
  } catch (error) {
    console.error("Error counting users:", error);
    return res.json({ status: false, msg: 'Error Occurred' });
  }
};

/**
 *********Deactivate users*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const activateUser = async (req, res) => {
  try {
    const userId = req.body.user_id || req.params.user_id;

    // Determine the model based on the existence of the userId in kidsmodel or adultmodel
    const model = await determineUserModel(userId);

    if (!model) {
      return res.json({ status: false, msg: 'User not found' });
    }

    try {
      await model.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { inActive: req.body.inActive } }
      );
      res.json({ status: true, msg: 'Updated successfully' });
    } catch (err) {
      res.json({ status: false, msg: err.message });
    }
  } catch (error) {
    res.json({ status: false, msg: 'error' });
  }
};

// Function to determine the model based on userId
async function determineUserModel(userId) {
  try {
    // Check if the userId exists in kidsmodel
    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) {
      return kidsmodel;
    }

    // Check if the userId exists in adultmodel
    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) {
      return adultmodel;
    }

    // If userId does not exist in either model, return null
    return null;
  } catch (error) {
    console.error("Error determining user model:", error);
    return null;
  }
}

/**
 *********addServices*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addServices = async (req, res) => {
  const { talentId, uniqueId, files } = req.body;

  try {
    // Generate unique IDs for each file
    const filesWithIds = files.map(file => ({
      ...file,
      id: uuidv4()
    }));

    // Define the update operation to push files into the specific service's files array
    const updateOperation = {
      $push: { 'services.$[elem].files': { $each: filesWithIds } }
    };

    // Define arrayFilters to match the service by uniqueId
    const arrayFilters = [{ 'elem.uniqueId': uniqueId }];

    // Try to find the talent in the kids model first and update
    let updatedTalent = await kidsmodel.findOneAndUpdate(
      { _id: talentId },
      updateOperation,
      { new: true, arrayFilters }
    );

    // If not found in kids model, try the adults model
    if (!updatedTalent) {
      updatedTalent = await adultmodel.findOneAndUpdate(
        { _id: talentId },
        updateOperation,
        { new: true, arrayFilters }
      );
    }

    if (!updatedTalent) {
      return res.status(200).json({
        status: false,
        message: 'Talent or service not found'
      });
    }

    // Return the updated talent document
    res.json({
      status: true,
      message: 'Files added to service successfully',
      data: updatedTalent
    });
  } catch (error) {

    res.status(500).json({
      status: false,
      message: 'An error occurred while adding the files to the service',
      error: error.message
    });
  }
};



/**
 *********deleteService*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const deleteService = async (req, res) => {
  const { talentId, serviceUniqueId, fileId } = req.body;

  try {
    // Define the update operation to remove the file from the service's files array
    const updateOperation = {
      $pull: { 'services.$.files': { id: fileId } }
    };

    // Try to find the talent in the kids model first and update it
    let updatedTalent = await kidsmodel.findOneAndUpdate(
      { _id: talentId, 'services.uniqueId': serviceUniqueId },
      updateOperation,
      { new: true }
    );

    // If not found in kids model, try to find and update in adults model
    if (!updatedTalent) {
      updatedTalent = await adultmodel.findOneAndUpdate(
        { _id: talentId, 'services.uniqueId': serviceUniqueId },
        updateOperation,
        { new: true }
      );
    }

    // If the talent or service is not found in both models, return 404
    if (!updatedTalent) {
      return res.status(200).json({
        status: false,
        message: 'Talent or service not found'
      });
    }

    // Return the updated talent document
    return res.json({
      status: true,
      message: 'File deleted successfully',
      data: updatedTalent
    });
  } catch (error) {
    // Log the error and return a 500 response

    return res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the file',
      error: error.message
    });
  }
};


/**
 *********applyJobUsersList ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const applyJobUsersList = async (req, res) => {
  try {
    const brandId = req.body.brandId || req.params.brandId;

    if (!brandId) {
      return res.status(400).json({ status: false, msg: 'Brand ID is required' });
    }

    // Find active users who applied for jobs with the given brandId
    const users = await applymodel.find({ brandId: brandId, isActive: true });

    if (users && users.length > 0) {
      return res.json({ status: true, data: users });
    } else {
      return res.json({ status: false, msg: 'No users found' });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ status: false, msg: 'Error Occurred', error: error.message });
  }
};

/**
 *********deleteIndividualService ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteIndividualService = async (req, res) => {
  const { talentId, serviceId } = req.body;

  try {
    // Check if the talentId exists in KidsModel
    let talent = await kidsmodel.findById(talentId);
    let modelType = "kids";

    // If not found in KidsModel, check in AdultModel
    if (!talent) {
      talent = await adultmodel.findById(talentId);
      modelType = "adult";
    }

    // If talentId is not found in either model
    if (!talent) {
      return res.status(200).json({ message: "Talent not found" });
    }

    // Update the respective model
    const updatedTalent = await (modelType === "kids" ? kidsmodel : adultmodel).findByIdAndUpdate(
      talentId,
      { $pull: { services: { uniqueId: serviceId } } },
      { new: true }
    );

    res.status(200).json({ status: true, message: "Service deleted successfully", talent: updatedTalent });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};


/**
 *********type checking ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const typeChecking = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the brand model
    let talent = await brandsmodel.findOne({ brandEmail: email });
    let modelType = "brand";

    // If not found in the brand model, check in the kids model
    if (!talent) {
      talent = await kidsmodel.findOne({ parentEmail: email });
      modelType = "kids";
    }

    // If not found in the kids model, check in the adult model
    if (!talent) {
      talent = await adultmodel.findOne({ adultEmail: email });
      modelType = "adult";
    }

    // If the email is not found in any model
    if (!talent) {
      return res.status(200).json({ status: false, message: "Email not found" });
    }

    res.status(200).json({
      status: true,
      message: "Email found",
      modelType: modelType
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};


/**
 *********reviewsPosting******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
// Function to save notifications to the database
const saveReviewNotification = async (talentId, notificationMessage, reviewerName, reviewerId) => {
  try {
    // Fetch details of talent and reviewer
    const talent = await findUserById(talentId);
    const reviewer = await findUserById(reviewerId);

    // Create the notification document
    const notification = new notificationmodel({
      notificationType: 'Review Notification',
      talentId: talentId,
      notificationMessage: notificationMessage,
      reviewerName: reviewerName,
      reviewerId: reviewerId,
      isReport: true,
      reviewApproved: 'Approved',
      status: 'Approved',
      adminApproved: true,
      profileApprove: true,
      talentDetails: {
        parentFirstName: talent.parentFirstName,
        parentLastName: talent.parentLastName,
        parentEmail: talent.parentEmail,
        talentId: talentId,
        email: talent.adultEmail || talent.parentEmail || talent.brandEmail,
        childFirstName: talent.childFirstName,
        childLastName: talent.childLastName,
        preferredChildFirstname: talent.preferredChildFirstname,
        preferredChildLastName: talent.preferredChildLastName,
        image: talent.image,
        reviews: talent.reviews,
      },
      reviewerDetails: {
        name: reviewer.preferredChildFirstname || reviewer.brandName,
        reviewerId: reviewerId,
        email: reviewer.adultEmail || reviewer.parentEmail || reviewer.brandEmail,
        image: reviewer.image

      },
    });

    // Save the notification document
    const savedNotification = await notification.save();
    console.log("Notification saved successfully", savedNotification);
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};

const reportReview = async (req, res) => {
  const { comment, reviewerName, talentId, reviewerId } = req.body;

  try {
    // Check in the kids model first
    let modelType = "kids";
    let updateResult;

    // Attempt to find and update a review in the kids model
    updateResult = await kidsmodel.findOneAndUpdate(
      { _id: talentId, "reviews.reviewerId": reviewerId, "reviews.comment": comment },
      { $set: { "reviews.$.isReport": true } },
      { new: true } // Return the updated document
    );

    // If not found in the kids model, check in the adult model
    if (!updateResult) {
      modelType = "adult";
      updateResult = await adultmodel.findOneAndUpdate(
        { _id: talentId, "reviews.reviewerId": reviewerId, "reviews.comment": comment },
        { $set: { "reviews.$.isReport": true } },
        { new: true } // Return the updated document
      );
    }

    // Save the notification regardless of the update result
    await saveReviewNotification(talentId, comment.trim(), reviewerName, reviewerId);

    if (updateResult) {
      res.status(200).send({ message: "Report sent successfully", status: true });
    } else {
      res.status(200).send({ message: "No matching reviews found", status: false });
    }
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).send({ message: "An error occurred while reporting the review" });
  }
};





/**
 *********reviewsPosting******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const reviewsPosting = async (req, res) => {
  const { comment, starRatings, reviewerName, talentId, reviewerId } = req.body;

  try {
    // Check in the kids model first
    let talent = await kidsmodel.findOne({ _id: talentId });
    let modelType = "kids";

    // If not found in the kids model, check in the adult model
    if (!talent) {
      talent = await adultmodel.findOne({ _id: talentId });
      modelType = "adult";
    }

    // If talent is found, update the reviews array

    console.log("talent", talent)
    if (talent) {
      // Add the new review to the reviews array
      talent.reviews.push({
        comment: comment,
        starRatings: starRatings.toString(),
        reviewDate: new Date(), // Set the current date
        reviewerName: reviewerName,
        reviewerId: reviewerId,
        reviewApproved: 'Approved',
        isReport: false
      });

      // Calculate the average of the starRatings values
      const totalReviews = talent.reviews.length;
      const totalStarRatings = talent.reviews.reduce((sum, review) => sum + parseFloat(review.starRatings), 0);
      let averageStarRatings = totalStarRatings / totalReviews;

      // Round to the nearest whole number, rounding up for .5 and above
      averageStarRatings = Math.round(averageStarRatings);

      // Ensure the averageStarRatings is within the range of 1 to 5
      averageStarRatings = Math.max(1, Math.min(5, averageStarRatings));

      // Ensure it has one decimal place
      averageStarRatings = averageStarRatings.toFixed(1);

      // Optionally, you could store the averageStarRatings in the document if needed
      talent.averageStarRatings = averageStarRatings;
      talent.totalReviews = totalReviews;

      // Save the updated document
      await talent.save();
      res.status(200).send({
        message: "Review added successfully",
        data: {
          averageStarRatings: averageStarRatings,
          totalReviews: totalReviews
        }
      });
      //res.status(200).send({ message: "Review added successfully",data: averageStarRatings:averageStarRatings, totalReviews:totalReviews]});
    } else {
      res.status(200).send({ message: "Talent not found" });
    }
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).send({ message: "An error occurred while adding the review" });
  }
};
/**
 *********deleteVideoUrls******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
//  const deleteVideoUrls = async (req, res) => {
//   const { talentId, index } = req.body;

//   try {
//     // Validate input
//     if (!talentId || index === undefined || index < 0) {
//       return res.status(200).send({ message: "Invalid input" });
//     }

//     // Find the talent document in the kids model
//     let talent = await kidsmodel.findById(talentId);
//     let modelType = 'kids';

//     // If not found, check in the adults model
//     if (!talent) {
//       talent = await adultmodel.findById(talentId);
//       modelType = 'adults';
//     }

//     // If talent not found in both models
//     if (!talent) {
//       return res.status(200).send({ message: "Talent not found" });
//     }

//     // Validate index for both videoList and audioList
//     const videoListLength = talent.videoList ? talent.videoList.length : 0;
//     const audioListLength = talent.audioList ? talent.audioList.length : 0;

//     if (index >= videoListLength && index >= audioListLength) {
//       return res.status(400).send({ message: "Invalid index" });
//     }

//     // Remove the URL at the specified index from videoList and audioList if applicable
//     if (index < videoListLength) {
//       talent.videoList.splice(index, 1);
//     }

//     if (index < audioListLength) {
//       talent.audioList.splice(index, 1);
//     }

//     // Save the updated document
//     await talent.save();

//     res.status(200).send({
//       message: "URL deleted successfully",
//       videoList: talent.videoList,
//       audioList: talent.audioList,
//     });
//   } catch (error) {
//     console.error("Error deleting URL:", error);
//     res.status(500).send({ message: "An error occurred while deleting the URL" });
//   }
// };
const deleteVideoUrls = async (req, res) => {
  const { talentId, index } = req.body;

  try {
    // Validate input
    if (!talentId || index === undefined || index < 0) {
      return res.status(400).send({ message: "Invalid input" });
    }

    // Find the talent document in the kids model
    let talent = await kidsmodel.findById(talentId);
    let modelType = 'kids';

    // If not found, check in the adults model
    if (!talent) {
      talent = await adultmodel.findById(talentId);
      modelType = 'adults';
    }

    // If talent not found in both models
    if (!talent) {
      return res.status(200).send({ message: "Talent not found" });
    }

    // Check if the index is valid
    if (index >= talent.videoList.length) {
      return res.status(200).send({ message: "Invalid index" });
    }

    // Remove the URL at the specified index
    talent.videoList.splice(index, 1);

    // Save the updated document
    await talent.save();

    res.status(200).send({ status: true, message: "URL deleted successfully", videoList: talent.videoList });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).send({ status: false, message: "An error occurred while deleting the URL" });
  }
};


/**
 *********deleteAudioUrls ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteAudioUrls = async (req, res) => {
  const { talentId, index } = req.body;

  try {
    // Validate input
    if (!talentId || index === undefined || index < 0) {
      return res.status(400).send({ message: "Invalid input" });
    }

    // Find the talent document in the kids model
    let talent = await kidsmodel.findById(talentId);
    let modelType = 'kids';

    // If not found, check in the adults model
    if (!talent) {
      talent = await adultmodel.findById(talentId);
      modelType = 'adults';
    }

    // If talent not found in both models
    if (!talent) {
      return res.status(200).send({ message: "Talent not found" });
    }

    // Check if the index is valid
    if (index >= talent.audioList.length) {
      return res.status(200).send({ message: "Invalid index" });
    }

    // Remove the URL at the specified index
    talent.audioList.splice(index, 1);

    // Save the updated document
    await talent.save();

    res.status(200).send({ status: true, message: "URL deleted successfully", audioList: talent.audioList });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).send({ status: false, message: "An error occurred while deleting the URL" });
  }
};
/**
 *********getDataByPublicUrl ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const getDataByPublicUrl = async (req, res) => {
  try {
      // Extract and normalize publicUrl and userId
      const publicUrl = req.body.publicUrl.trim().toLowerCase();
      const { userId } = req.body;

      // Function to find the user in the specified models
      const findUserInModels = async (publicUrl, userId) => {
          const models = [
              { model: adultmodel, name: "Adult" },
              { model: kidsmodel, name: "Kids" },
              { model: brandsmodel, name: "Brands" }
          ];

          for (const { model, name } of models) {
              try {
                  console.log(`Querying ${name} model for userId:`, userId);

                  // Check for user with the given publicUrl and userId
                  const user = await model.findOne({
                      publicUrl: { $regex: new RegExp(`^${publicUrl}$`, 'i') }, // Case-insensitive regex
                      _id: userId, // using userId directly
                      isActive: true,
                      inActive: true
                  });

                  // If user is found, return the result
                  if (user) {
                      console.log(`${name} model found user:`, user);
                      return { status: true, data: user, currentStatus: "own-talent", model: name };
                  }
              } catch (error) {
                  console.error(`Error querying ${name} model:`, error.message);
              }
          }

          // If no user found in any model with userId
          return { status: false, message: "User not found with specified userId." };
      };

      // First, search for the user in all models with userId
      const userWithId = await findUserInModels(publicUrl, userId);
      if (userWithId.status) return res.json(userWithId);

      // If not found with userId, check for publicUrl without userId
      const findUserWithoutId = async (publicUrl) => {
          const models = [
              { model: adultmodel, name: "Adult" },
              { model: kidsmodel, name: "Kids" },
              { model: brandsmodel, name: "Brands" }
          ];

          for (const { model, name } of models) {
              try {
                  console.log(`Checking admin approval in ${name} model for publicUrl:`, publicUrl);
                  const user = await model.findOne({
                      publicUrl: { $regex: new RegExp(`^${publicUrl}$`, 'i') } // Case-insensitive regex
                  });

                  if (user) {
                      console.log(`${name} model found user for approval check:`, user);
                      // Check for admin approval status
                      if (!user.adminApproved) {
                          return { status: true, data: [], currentStatus: "not-approved", model: name };
                      }
                      return { status: true, data: user, currentStatus: "approved", model: name };
                  }
              } catch (error) {
                  console.error(`Error checking admin approval in ${name} model:`, error.message);
              }
          }

          return null; // Return null if user not found in any model
      };

      // Check admin approval status
      const adminApprovalStatus = await findUserWithoutId(publicUrl);
      if (adminApprovalStatus) return res.json(adminApprovalStatus);

      // If no user found
      return res.json({ status: false, msg: "User not found" });

  } catch (error) {
      console.error('Error occurred while fetching data:', error);
      return res.status(500).json({ status: false, msg: 'Error occurred while fetching data' });
  }
};




//  const getDataByPublicUrl = async (req, res) => {
//   try {
//     // Extract and normalize publicUrl and userId
//     const publicUrl = req.body.publicUrl.trim().toLowerCase();
//     const { userId } = req.body;

//   // Function to check for user in models
// const checkUserInModels = async (publicUrl, userId) => {
//   const models = [adultmodel, kidsmodel, brandsmodel];

//   for (const model of models) {
//       try {
//           // Log model being queried
//           console.log("Querying model:", model.modelName);

//           console.log("model",model)

//           // Query the model
//           const user = await model.findOne({
//               publicUrl: publicUrl, // Ensure this matches exactly
//               _id: new mongoose.Types.ObjectId(userId) // Ensure it's an ObjectId
//           });

//           // Log user data and query parameters
//           console.log("User found:", user);
//           console.log("Query parameters - publicUrl:", publicUrl, "userId:", userId);

//           // Check if user is found
//           if (user) return { status: true, data: user, currentStatus: "own-talent" };
//       } catch (error) {
//           // Log any errors encountered during the query
//           console.error("Error querying model:", model.modelName, error);
//       }
//   }
  
//   // Return null if no user is found in any model
//   return { status: false, message: "User not found in any model." };
// };

  
//     // First, search for the user in all models with userId
//     const userWithId = await checkUserInModels(publicUrl, userId);
//     if (userWithId) return res.json(userWithId);

//     // Second, search for the user in all models without userId
//     const checkAdminApproval = async (publicUrl) => {
//       console.log("check1111111")
//       console.log("publicUrl",publicUrl)
//       const models = [adultmodel, kidsmodel, brandsmodel];
//       for (const model of models) {
//         console.log("check22222222222222222")
//         const user = await model.find({ publicUrl });
//         console.log("user",user)
//         if (user) {
//           console.log("check33333333333333333333")
//           // Check for admin approval
//           if (user.adminApproved === false) {
//             return { status: true, data: [], currentStatus: "not-approved" };
//           }
//           if (user.adminApproved === true) {
//             console.log("check4444444444444444444444")
//             return { status: true, data: user, currentStatus: "approved" };
//           }
//         }
//       }
//       return null;
//     };
 
//     // Check admin approval status
//     const adminApprovalStatus = await checkAdminApproval(publicUrl);
//     if (adminApprovalStatus) return res.json(adminApprovalStatus);

//     // If no user found
//     return res.json({ status: false, msg: "User not found" });

//   } catch (error) {
//     console.error('Error occurred while fetching data:', error);
//     return res.status(500).json({ status: false, msg: 'Error occurred while fetching data' });
//   }
// };







// const getDataByPublicUrl = async (req, res) => {
//   try {
//     // Extract publicUrl from req.body and trim any extra spaces
//     const publicUrl = req.body.publicUrl.trim().toLowerCase(); // Normalize to lowercase
    

//     // Check if the user with the given publicUrl exists in adultmodel
//     const adultUser = await adultmodel.findOne({
//       publicUrl: { $regex: new RegExp(`^${publicUrl}$`, 'i') }, // Case-insensitive regex
//       isActive: true,
//       inActive: true
//     });
//     if (adultUser) {
//       return res.json({ status: true, data: adultUser });
//     }

//     // Check if the user with the given publicUrl exists in kidsmodel
//     const kidsUser = await kidsmodel.findOne({
//       publicUrl: { $regex: new RegExp(`^${publicUrl}$`, 'i') }, // Case-insensitive regex
//       isActive: true,
//       inActive: true
//     });
//     if (kidsUser) {
//       return res.json({ status: true, data: kidsUser });
//     }

//     // Check if the user with the given publicUrl exists in brandsmodel
//     const brandUser = await brandsmodel.findOne({
//       publicUrl: { $regex: new RegExp(`^${publicUrl}$`, 'i') }, // Case-insensitive regex
//       isActive: true,
//       inActive: true
//     });
//     if (brandUser) {
//       return res.json({ status: true, data: brandUser });
//     }

//     // If no user is found in any model, return an appropriate response
//     return res.json({ status: false, msg: 'No user found' });
//   } catch (error) {
//     console.error('Error occurred while fetching data:', error);
//     return res.status(500).json({ status: false, msg: 'Error occurred while fetching data' });
//   }
// };

/**
 *********fetchPaymentDetails ******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const fetchPaymentDetails = async (req, res, next) => {
  try {
    const userId = req.body.user_id;

    // Find the user in all three models
    const kidsUser = await kidsmodel.findOne({ _id: userId, isActive: true });
    const adultUser = await adultmodel.findOne({ _id: userId, isActive: true });
    const brandUser = await brandsmodel.findOne({ _id: userId, isActive: true });

    // Determine which model to use
    let model = null;

    if (kidsUser) {
      model = kidsmodel;
    } else if (adultUser) {
      model = adultmodel;
    } else if (brandUser) {
      model = brandsmodel;
    }

    // If no user is found in any model, return an appropriate message
    if (!model) {
      return res.status(200).json({ status: false, msg: 'User not found or not active' });
    }

    // Fetch user details
    const userDetails = await model.findOne({ _id: userId, isActive: true });

    if (!userDetails) {
      return res.status(200).json({ status: false, msg: 'User details not found' });
    }

    // Return the user details
    res.json({ status: true, data: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: `Server error: ${error.message}` });
  }
};
/**
*********directKidsLogin******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const directKidsLogin = async (req, res, next) => {
  try {
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

    // Generate a token, assuming auth.getToken() is a valid method
    const token = auth.gettoken(user._id, newEmail); // Ensure `auth.getToken` exists and is imported

    // Return success response
    return res.json({
      status: true,
      message: 'Login successful',
      data: {
        user,
        token,
        email: newEmail,
        type: 'kids' // Returning 'kids' as the user type
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.json({
      message: "An error occurred",
      status: false,
      error: error.toString()
    });
  }
};
const test = async (req, res, next) => {
  let orConditions = [];

  // Get the social media platforms from req.body.socialmedia (expected as an array)
  const socialMediaPlatforms = req.body.socialmedia || [];

  // Extract min and max followers count from req.body
  const minfollowerscount = parseInt(req.body.minfollowerscount, 10) || 0;
  const maxfollowerscount = parseInt(req.body.maxfollowerscount, 10) || Infinity;

  // Function to create follower condition with safe conversion
  const createFollowerCondition = (field) => ({
    $expr: {
      $and: [
        {
          $gte: [
            {
              $convert: {
                input: `$${field}`,
                to: "int",
                onError: 0,  // Use 0 if conversion fails
                onNull: 0    // Use 0 if the field is null or empty
              }
            },
            minfollowerscount
          ]
        },
        {
          $lte: [
            {
              $convert: {
                input: `$${field}`,
                to: "int",
                onError: 0,
                onNull: 0
              }
            },
            maxfollowerscount
          ]
        }
      ]
    }
  });

  // Add conditions for each platform based on its inclusion in req.body.socialmedia
  if (socialMediaPlatforms.includes('facebook')) {
    orConditions.push(createFollowerCondition('facebookFollowers'));
  }

  if (socialMediaPlatforms.includes('instagram')) {
    orConditions.push(createFollowerCondition('instaFollowers'));
  }

  if (socialMediaPlatforms.includes('linkedin')) {
    orConditions.push(createFollowerCondition('linkedinFollowers'));
  }

  if (socialMediaPlatforms.includes('threads')) {
    orConditions.push(createFollowerCondition('threadsFollowers'));
  }

  if (socialMediaPlatforms.includes('tiktok')) {
    orConditions.push(createFollowerCondition('tiktokFollowers'));
  }

  if (socialMediaPlatforms.includes('twitter')) {
    orConditions.push(createFollowerCondition('twitterFollowers'));
  }

  if (socialMediaPlatforms.includes('youtube')) {
    orConditions.push(createFollowerCondition('youtubeFollowers'));
  }

  // Query to ensure that conditions match for any of the included platforms
  const query = orConditions.length > 0 ? { $or: orConditions } : {};

  try {
    // Run the query in the KidsModel, AdultModel, and BrandsModel
    const kidsResults = await kidsmodel.find(query);
    const adultResults = await adultmodel.find(query);

    // Combine results from all models
    const allResults = [...kidsResults, ...adultResults];

    // Send the combined results
    res.status(200).json(allResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 *********talentLists*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const talentLists = async (req, res) => {
  try {
    // Find all active adults
    const activeAdults = await adultmodel.find({ isActive: true }); // adminApproved: true

    // Find all active kids
    const activeKids = await kidsmodel.find({ isActive: true, inActive: true}); // adminApproved: true

    // Combine both lists
    let allActiveUsers = [...activeAdults, ...activeKids];

    // Sort the combined list by createdAt in descending order
    allActiveUsers = allActiveUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Reverse the sorted array
    allActiveUsers = allActiveUsers.reverse();

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




module.exports = {
  kidsSignUp, adultSignUp, adultFetch, forgotPassword, resetPassword, updateAdults, deleteUser, kidsFetch, otpVerification, subscriptionPlan,
  otpVerificationAdult, editKids, unifiedDataFetch, otpResend, otpResendAdult,
  deleteFile, talentList, talentFilterData, setUserFavorite, talentLogin, searchTalent, checkProfileStatus,
  getTalentById, updateProfileStatus, subscriptionStatus, getByProfession, loginTemplate, getPlanByType,
  removeFavorite, checkUserStatus, socialSignup, updateAdultPassword, adultForgotPassword, adultResetPassword,
  fetchUserData, countUsers, activateUser, addServices, deleteService, applyJobUsersList, deleteIndividualService,
  typeChecking, reviewsPosting, deleteVideoUrls, reportReview, getDataByPublicUrl, deleteAudioUrls, fetchPaymentDetails, directKidsLogin, test,talentLists

};