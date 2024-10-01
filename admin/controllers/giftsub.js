const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
var loginData = require('../../emailCredentials.js');
const { gmail: { host, pass } } = loginData;
const nodemailer = require('nodemailer');


const GiftSubscriptions = require('../models/giftsubmodel');
const couponmodel = require("../models/couponmodel");
const kidsmodel = require("../../users/models/kidsmodel.js");
const adultmodel = require("../../users/models/adultmodel.js");
const brandsmodel = require("../../brands/models/brandsmodel.js");
const giftsubmodel = require("../models/giftsubmodel");
const transactionmodel = require("../models/transactionmodel.js");


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: host,
    pass: pass
  }

});
// Function to generate a unique code
const generateUniqueCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Generates an 8-character hexadecimal code
};
const giftSubCreation = async (req, res, next) => {
  try {
    const { email, gift, senderName } = req.body;
    console.log("inside gifttttttt")

    if (!email || !gift || !Array.isArray(gift) || gift.length === 0) {
      return res.status(200).json({ status: false, message: 'Email and gift array are required' });
    }

    // Determine the user by checking if the email exists in any of the models
    let user = await kidsmodel.findOne({ parentEmail: { $regex: new RegExp(`^${email}$`, 'i') } });
    let userType = 'Kids';

    if (!user) {
      user = await adultmodel.findOne({ adultEmail: { $regex: new RegExp(`^${email}$`, 'i') } });
      userType = user ? 'Adult' : null;
    }

    if (!user && !userType) {
      user = await brandsmodel.findOne({ brandEmail: { $regex: new RegExp(`^${email}$`, 'i') } });
      userType = user ? 'Brands' : null;
    }

    // If user is not found, return a message
    if (!user) {
      return res.status(200).json({ status: false, message: 'User with the provided email not found' });
    }

    // Check user's subscription plan
    const { planName } = user; // Assuming user contains subscription info
    console.log("planName", planName)
    if (planName !== 'Pro' && planName !== 'Premium') {
      return res.status(200).json({ status: false, message: 'Upgrade your plan to Pro or Premium to send a gift.' });
    }

    // Create the gift array with unique ObjectId for each gift
    const gifts = gift.map(giftItem => ({
      code: generateUniqueCode(),
      receiverEmail: giftItem.receiverEmail,
      receiversFirstName: giftItem.receiversFirstName,
      announceDate: new Date(),
      message: giftItem.message,
      subscriptionPlan: giftItem.subscriptionPlan,
      planName: giftItem.planName,
      paymentStatus: giftItem.paymentStatus,
      transId: giftItem.transId,
      transactionDate: giftItem.transactionDate || new Date(),
      paymentCurrency: giftItem.paymentCurrency,
      paymentAmount: giftItem.paymentAmount,
      paymentPeriod: giftItem.paymentPeriod,
      paymentPlan: giftItem.paymentPlan,
    }));

    // Check if subscription already exists for the user
    let existingSubscription = await GiftSubscriptions.findOne({ email: email });

    // Handle the first gift transaction
    const firstGift = gifts[0];
    let transaction;

    if (firstGift && firstGift.transId) {
      transaction = new transactionmodel({
        transId: firstGift.transId,
        type: 'gift',
        email: req.body.email,
        senderName: req.body.senderName,
        isActive: true,

      });
      console.log("testinggg gift", transaction)
    }

    if (existingSubscription) {
      existingSubscription.gift.push(...gifts);
      existingSubscription.isActive = true; // Ensure subscription is active
      await existingSubscription.save();

      if (transaction) {
        transaction.verifyId = existingSubscription._id; // Link to existing subscription
        await transaction.save();
      }
    } else {
      console.log("elseeeeeeeeeeeeeeeeeeee")
      const newSub = new GiftSubscriptions({
        senderName,
        email,
        user_id: user._id,
        userType,
        gift: gifts,
        isActive: true,
      });

      await newSub.save();
      console.log("newSubbbbbbbbbbbbbbbbbbbbbb", newSub)

      if (transaction) {
        transaction.verifyId = newSub._id; // Link to new subscription
        await transaction.save();
      }
    }

    // Return success response
    res.status(200).json({
      message: 'Successfully added',
      status: true,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: false, message: 'Failed to create or update gift subscription' });
  }
};


/**
*********getGiftSubscriptions******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getGiftSubscriptions = async (req, res) => {
  try {
    // Find all active gift subscriptions
    const activeSubscriptions = await GiftSubscriptions.find({ isActive: true });

    // Respond with the list of active gift subscriptions
    res.status(200).json({
      message: 'success',
      status: true,
      data: activeSubscriptions,
    });
  } catch (error) {
    console.error("Error fetching active gift subscriptions:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

/**
*********subscriptionReminder******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

/**
*********getGiftSubscriptions******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getGiftSubscriptionsByUser = async (req, res) => {
  try {
    const userId = req.body.user_id;
    // Find all active gift subscriptions
    const activeSubscriptions = await GiftSubscriptions.find({ isActive: true, user_id: userId });

    // Respond with the list of active gift subscriptions
    res.status(200).json({
      message: 'success',
      status: true,
      data: activeSubscriptions,
    });
  } catch (error) {
    console.error("Error fetching active gift subscriptions:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};
/**
 *********updateGift*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const updateGift = async (req, res) => {
  try {
    const giftId = req.body.giftId || req.params.giftId;
    const email = req.body.email;
    const giftCode = req.body.giftCode;

    // Check if giftId, email, and giftCode are provided
    if (!giftId || !email || !giftCode) {
      return res.status(200).json({ status: false, msg: 'giftId, email, and giftCode are required' });

    }


    // Payment status check 
    if (req.body.gift?.[0]?.paymentStatus && req.body.gift[0].paymentStatus !== 'APPROVED') {
      return res.status(200).json({ status: false, msg: 'Cannot update gift with non-Credited payment status' });
    }
    // Find the document with the specified giftId
    const giftDoc = await giftsubmodel.findOne({ _id: new mongoose.Types.ObjectId(giftId) });
    console.log("giftDoc", giftDoc)
    if (!giftDoc) {
      return res.status(200).json({ status: false, msg: 'Gift not found' });
    }
    // Find the index of the item in the gift array with the matching giftCode
    const itemIndex = giftDoc.gift.findIndex(g => g.code === giftCode);
    console.log("itemIndex", itemIndex)

    if (itemIndex === -1) {
      return res.status(200).json({ status: false, msg: 'Gift item with the specified code not found' });
    }



    // Find the coupon with type "free code"
    const coupon = await couponmodel.findOne({ type: 'free code' });
    if (!coupon) {
      return res.status(200).json({ status: false, message: 'Free code coupon not found' });
    }

    // Set expiry from the coupon
    const expiryDate = coupon.expiry;
    // Prepare the updated fields for the gift item at the specified index
    const updatedFields = {
      [`gift.${itemIndex}.coupon`]: coupon.code,
      [`gift.${itemIndex}.expiry`]: expiryDate,
      [`gift.${itemIndex}.receiversFirstName`]: req.body.gift[0].receiversFirstName || giftDoc.gift[itemIndex].receiversFirstName,// [`gift.${itemIndex}.receiversFirstName`]: req.body.gift?.[0]?.receiversFirstName || giftDoc.gift[itemIndex]
      [`gift.${itemIndex}.receiverEmail`]: req.body.gift[0].receiverEmail || giftDoc.gift[itemIndex].receiverEmail,
      [`gift.${itemIndex}.message`]: req.body.gift[0].message || giftDoc.gift[itemIndex].message,
      [`gift.${itemIndex}.subscriptionPlan`]: req.body.gift[0].subscriptionPlan || giftDoc.gift[itemIndex].subscriptionPlan,
      [`gift.${itemIndex}.planName`]: req.body.gift[0].planName || giftDoc.gift[itemIndex].planName,
      [`gift.${itemIndex}.paymentStatus`]: req.body.gift[0].paymentStatus || giftDoc.gift[itemIndex].paymentStatus,
      [`gift.${itemIndex}.transId`]: req.body.gift[0].transId || giftDoc.gift[itemIndex].transId,
      [`gift.${itemIndex}.transactionDate`]: req.body.gift[0].transactionDate || giftDoc.gift[itemIndex].transactionDate,
      [`gift.${itemIndex}.paymentCurreny`]: req.body.gift[0].paymentCurreny || giftDoc.gift[itemIndex].paymentCurreny,
      [`gift.${itemIndex}.paymentAmount`]: req.body.gift[0].paymentAmount || giftDoc.gift[itemIndex].paymentAmount,
      [`gift.${itemIndex}.paymentPeriod`]: req.body.gift[0].paymentPeriod || giftDoc.gift[itemIndex].paymentPeriod,
      [`gift.${itemIndex}.paymentPlan`]: req.body.gift[0].paymentPlan || giftDoc.gift[itemIndex].paymentPlan,
      //[`gift.${itemIndex}.expiry`]: req.body.gift[0].expiry || giftDoc.gift[itemIndex].expiry, // Only if expiry field is provided
    };
    console.log("updatedFields", updatedFields)
    // Update the gift item in the giftsubmodel collection
    const result = await giftsubmodel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(giftId) },
      { $set: updatedFields }
    );

    if (result.nModified === 0) {
      return res.status(200).json({ status: false, msg: 'No matching gift item found to update' });
    }

    // Find the user by email in one of the models (Kids, Adults, Brands)
    let userType = null;
    let user = null;

    // Check Kids model
    user = await kidsmodel.findOne({ parentEmail: email });
    if (user) {
      userType = 'Kids';
    } else {
      // Check Adult model
      user = await adultmodel.findOne({ adultEmail: email });
      if (user) {
        userType = 'Adult';
      } else {
        // Check Brands model
        user = await brandsmodel.findOne({ brandEmail: email });
        if (user) {
          userType = 'Brands';
        }
      }
    }

    if (!user) {
      return res.status(200).json({ status: false, msg: 'User not found' });
    }
    // Determine the model to update
    let modelToUpdate;
    if (userType === 'Kids') {
      modelToUpdate = kidsmodel;
    } else if (userType === 'Adult') {
      modelToUpdate = adultmodel;
    } else if (userType === 'Brands') {
      modelToUpdate = brandsmodel;
    }


    // Fetch updated giftDoc after update
    const updatedGiftDoc = await giftsubmodel.findOne({ _id: new mongoose.Types.ObjectId(giftId) });

    // Update the user model
    const userUpdateFields = {
      senderName: req.body.senderName,
      email: req.body.email,
      user_id: user._id,
      userType: userType,
      gift: updatedGiftDoc.gift,  // Updated gift array
      isActive: req.body.isActive || true,
    };
    //20 adeddd
    // Update the user model
    await modelToUpdate.updateOne(
      { _id: user._id },
      { $set: userUpdateFields }
    );

    const receiverEmail = req.body.gift[0].receiverEmail;
    const receiversFirstName = req.body.gift[0].receiversFirstName;
    console.log("recieverEmail", receiverEmail)
    if (!receiverEmail) {
      return res.status(200).json({ status: false, msg: 'Receiver email not provided' });
    }
    const senderEmail = req.body.email;
    const senderName = req.body.senderName || 'Brands and Talent Team';


    // Send email notifications
    const mailOptions = {
      from: host,
      to: receiverEmail,
      subject: 'Gift Received',
      html: `
        <p>Hi ${receiversFirstName},</p>
        <p>You have received a gift from ${req.body.senderName || 'Brands and Talent Team'}.</p>
        <p>You can apply this coupon code: <strong>${coupon.code}</strong> and it is valid until ${expiryDate}.</p>
        <p>Enjoy your gift!</p>
        <p><a href="https://brandsandtalent.com/" style="text-decoration: underline; color: #007bff;">Create an account in Brands and Talent</a> to be part of our team.</p>
        <p>Best regards,<br/>Brands And Talent Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    const senderMailOptions = {
      from: host,
      to: senderEmail,
      subject: 'Gift Sent Successfully',
      html: `
        <p>Hi ${senderName},</p>
        <p>You have successfully sent a coupon to: <strong>${receiversFirstName}</strong>.</p>
        <p>The coupon code <strong>${coupon.code}</strong> is valid until ${expiryDate}.</p>
        <p>Thank you for gifting with Brands and Talent!</p>
        <p>Best regards,<br/>Brands And Talent Team</p>
      `,
    };

    await transporter.sendMail(senderMailOptions);

    // Respond with success
    res.json({ status: true, msg: 'Updated successfully' });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: false, msg: err.message || 'Error Occurred' });
  }
};




module.exports = {
  giftSubCreation, getGiftSubscriptions, getGiftSubscriptionsByUser, updateGift
};