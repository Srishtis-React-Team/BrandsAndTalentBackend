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


const couponmodel = require('../models/couponmodel');
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");
const brandsmodel = require("../../brands/models/brandsmodel");
const giftsubmodel = require("../models/giftsubmodel");
const transactionmodel = require("../models/transactionmodel");

/**
*********couponGeneration******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const generateCouponCode = () => Math.random().toString(36).substr(2, 10).toUpperCase();

const couponGeneration = async (req, res) => {
  try {
    const { discountAmount, expiry, type, currency,subscriptionPlan,planName } = req.body;//isPercent = false,

    if (!discountAmount || !expiry) return res.status(200).json({ message: "Required fields are missing" });

    const newCoupon = new couponmodel({
      code: generateCouponCode(),
      currency,
      discountAmount,
      isActive: true,
      expiry,
      type,
      subscriptionPlan,
      planName
    });

    await newCoupon.save();
    res.status(200).json({ message: "Coupon generated successfully", coupon: newCoupon });
  } catch (error) {
    console.error("Error generating coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
*********activeCoupons******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const activeCoupons = async (req, res) => {
  try {
    const currentDate = new Date();

    // Find active and expired coupons
    const [activeCoupons, expiredCoupons] = await Promise.all([
      couponmodel.find({ isActive: true, expiry: { $gte: currentDate } }).sort({ createdAt: -1 }),
      couponmodel.find({ isActive: true, expiry: { $lte: currentDate } })
    ]);

    // Update the `isActive` field for expired coupons
    await Promise.all(expiredCoupons.map(coupon => {
      coupon.isActive = false;
      return coupon.save();
    }));

    // Respond with active coupons
    res.status(200).json({ message: 'success', status: true, data: activeCoupons });
  } catch (error) {
    console.error("Error fetching and updating coupons:", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

/**
*********applyCoupon******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const applyCoupon = async (req, res) => {


  try {
    const { userId, code, totalAmount, subscriptionPlan, planName } = req.body;//receiverEmail

    // Trim the code to remove any leading or trailing whitespace
    const trimmedCode = code.trim();

    if (!userId || !code || !totalAmount) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Find the coupon by code
    const coupon = await couponmodel.findOne({ code: trimmedCode, isActive: true });
    if (!coupon || new Date() > coupon.expiry) {
      return res.status(200).json({ message: "Coupon is invalid or expired" });
    }

    // Function to check if a user exists in a model
    const findUserInModel = async (model) => {
      return await model.findById(userId);
    };

    // Search for the user in the kids, adult, and brands models
    const [kidsUser, adultUser, brandsUser] = await Promise.all([
      findUserInModel(kidsmodel),
      findUserInModel(adultmodel),
      findUserInModel(brandsmodel),
    ]);
  
    // Determine the user model
    let user = kidsUser || adultUser || brandsUser;
    console.log("user",user)
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }
  

    let userEmail = user.parentEmail || user.brandEmail||user.adultEmail;
    console.log("userEmail", userEmail);

    // Ensure coupon field is an array
    if (!Array.isArray(user.coupon)) {
      user.coupon = [];
    }

    // Check if the user has already used this coupon
    const hasUsedCoupon = user.coupon.some(c =>
      c.couponId && c.couponId.toString() === coupon._id.toString()
    );
    console.log("hasUsedCoupon", hasUsedCoupon);

    if (hasUsedCoupon) {
      return res.status(200).json({ status: false, message: "Coupon has already been used" });
    }

    const result = await giftsubmodel.findOne(
      { 
        "gift.receiverEmail": userEmail, // receiverEmail
        "gift.coupon": code // code in the gift document
      },
      {
        gift: {
          $elemMatch: {
            receiverEmail: userEmail,
            coupon: code
          }
        }
      }
    )
    
    console.log("giftresult",result.gift)
  
    if (result && result.gift.length > 0) {
      console.log("checkinggggggg")

      const { subscriptionPlan: giftSubscriptionPlan, planName: giftPlanName } = result.gift[0];
      console.log("Found gift subscription:", giftSubscriptionPlan, giftPlanName);
      
      // Use the actual values from req.body for comparison
      if (giftSubscriptionPlan === subscriptionPlan && giftPlanName === planName) {
        console.log("Coupon application successful");
        
        // Calculate the discount amount
        let discountAmounts = (totalAmount * coupon.discountAmount) / 100;
        discountAmounts = parseFloat(discountAmounts.toFixed(2)); // Round to 2 decimal places

        // Subtract the discount from the totalAmount
        let discountAmount = totalAmount - discountAmounts;
        discountAmount = parseFloat(discountAmount.toFixed(2));

        // Send the response with the final amount
        return res.status(200).json({
          status: true,
          message: "Coupon applied successfully",
          discountAmount,
          couponDiscountPercent: coupon.discountAmount
        });
      } else {
        console.log("lastttttt not metc hed")
        return res.status(200).json({
          status: false,
          message: `Your gifted planName and subscriptionPlan are ${giftPlanName}, ${giftSubscriptionPlan} please choose correct plan`
        });
      }
    } else {
      console.log("lastttttt")
      return res.status(200).json({
        status: false,
        message: `Your gifted planName and subscriptionPlan are ${result.gift[0].planName}, ${result.gift[0].subscriptionPlan} please choose correct plan`
      });
     
    }

  } catch (error) {
    return res.status(200).json({
      status: false,
      message:'Invalid Coupon Plan'
    });
  
  }
};



/**
 *********editCoupon*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const editCoupon = async (req, res) => {
  try {
    const couponId = req.body.couponId || req.params.couponId;
    const updateFields = {
      isActive: true,
      //  isPercent: req.body.isPercent,
      discountAmount: req.body.discountAmount,
      expiry: req.body.expiry,
      type: req.body.type,
    };

    await couponmodel.updateOne(
      { _id: new mongoose.Types.ObjectId(couponId) },
      { $set: updateFields }
    );

    res.json({ status: true, msg: 'Updated successfully', data: { couponId, ...updateFields } });
  } catch (err) {
    res.json({ status: false, msg: err.message || 'Error Occurred' });
  }
};
/**
 *********deleteCoupon*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.body.couponId || req.params.couponId;
    await couponmodel.updateOne(
      { _id: new mongoose.Types.ObjectId(couponId) },
      { $set: { isActive: false } }
    );
    res.json({ status: true, msg: 'Deleted successfully' });
  } catch (err) {
    res.json({ status: false, msg: 'Error Occured' });
  }
};
module.exports = {
  couponGeneration, activeCoupons, applyCoupon, editCoupon, deleteCoupon
};