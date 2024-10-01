const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');
const FormData = require('form-data');
const pricingmodel = require('../models/pricingmodel');
const brandspricingmodel = require("../models/brandspricingmodel");
 const paymentTransationModal = require('../models/paymenttransation');
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");
const brandsmodel = require("../../brands/models/brandsmodel");
const transactionmodel = require("../models/transactionmodel");
const giftsubmodel = require("../models/giftsubmodel");
const couponmodel = require("../models/couponmodel");
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

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addPricing = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Pricing = new pricingmodel({
            planname: req.body.planname,
            gift: req.body.gift,
            price: req.body.price,
            period: req.body.period,
            data: req.body.data,
            plan_type_monthly: req.body.plan_type_monthly,
            plan_type_annual: req.body.plan_type_annual,
            annualTotalAmount: req.body.annualTotalAmount,
            isActive: true
        });

        const response = await Add_Pricing.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Pricing,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********pricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const pricingList = async (req, res, next) => {

    pricingmodel.find({ isActive: true }).sort({ created: -1 })
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
};

/**
 *********addBrandsPricing******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addBrandsPricing = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Pricing = new brandspricingmodel({
            planname: req.body.planname,
            gift: req.body.gift,
            price: req.body.price,
            period: req.body.period,
            data: req.body.data,
            plan_type_monthly: req.body.plan_type_monthly,
            plan_type_annual: req.body.plan_type_annual,
            annualTotalAmount: req.body.annualTotalAmount,
            isActive: true
        });

        const response = await Add_Pricing.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Pricing,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********brandsPricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const brandsPricingList = async (req, res, next) => {

    brandspricingmodel.find({ isActive: true }).sort({ created: -1 })
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
};



 const API_BASE_URL = 'https://checkout.payway.com.kh/api/payment-gateway/v1/payments';
//const API_BASE_URL = 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments'
const CREATE_PAYMENT_URL = `${API_BASE_URL}/purchase`;
const CHECK_TRANSACTION_URL = `https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2`;
const PUBLIC_KEY = '366b35eb-433b-4d8e-8ee9-036bcd3e2e2c';
const MERCHANT_ID = 'brandsandtalent';


const createPayment = async (req, res) => {
    const { amount, currency, type } = req.body;
    const transationData = await paymentTransationModal.find({});

    const hash = generateHash({
        req_time: getFormattedTimestamp(),
        merchant_id: MERCHANT_ID,
        tran_id: transationData[0].transactionid,
        amount: amount,
        payment_option: 'cards',
        continue_success_url: type,
        currency: currency,
    }, '366b35eb-433b-4d8e-8ee9-036bcd3e2e2c');


    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('currency', currency);
    formData.append('req_time', getFormattedTimestamp());  // Add timestamp
    formData.append('merchant_id', MERCHANT_ID);            // Add merchant ID
    formData.append('tran_id', transationData[0].transactionid);
    formData.append('payment_option', 'cards');
    formData.append('continue_success_url', type);
    formData.append('hash', hash);
    try {
        const response = await axios.post(CREATE_PAYMENT_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('response--payment--', response)
        console.log('response ---- url ----', response.request.res.responseUrl)

        const responseData = {
            status: response.status,
            statusText: response.statusText,
            data: response.data // Extract only the data part
        };

        await paymentTransationModal.findOneAndUpdate(
            { '_id': new mongoose.Types.ObjectId('66da8dfe5e5da894e55299eb') }, // Add criteria if needed
            { $inc: { transactionid: 1 } }, // Increment transactionid by 1
            { new: true } // Return the updated document
        );
        console.log('consoling transationid=====>>>>atlast----', transationData[0].transactionid)

        console.log('Payment Response:', responseData);
        res.json({ status: true, data: responseData, url: response.request.res.responseUrl, trans_id: transationData[0].transactionid });
    } catch (error) {
        console.error('Error during payment:', error);
    }
}



const getFormattedTimestamp = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const checkTransaction = async (req, res) => {
    const { tranId } = req.body;
    const requestTime = getFormattedTimestamp();
    const secret = '366b35eb-433b-4d8e-8ee9-036bcd3e2e2c'; // Your secret key
    const hash = generateCheckTransactionHash({
        requestTime: requestTime,
        merchant_id: 'brandsandtalent', // Assuming this is a constant value
        tran_id: tranId,
    }, secret);

    const form = new FormData();
    form.append('req_time', requestTime);
    form.append('merchant_id', 'brandsandtalent'); // Assuming this is a constant value
    form.append('tran_id', tranId);
    form.append('hash', hash);

    try {
        const response = await axios.post(CHECK_TRANSACTION_URL, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error catching:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error checking transaction status' });
    }
};

const createQrPayment = async (req, res) => {
    const { amount, currency, type } = req.body;
    const transationData = await paymentTransationModal.find({});
    const reqtime = getFormattedTimestamp()

    const hash = generateQrHash({
        req_time: reqtime,
        merchant_id: MERCHANT_ID,
        tran_id: transationData[0].transactionid,
        amount: amount,
        payment_option: 'abapay_khqr',
        continue_success_url: type,
        currency: currency,
    }, '366b35eb-433b-4d8e-8ee9-036bcd3e2e2c');
    console.log('hash', hash)
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('currency', currency);
    formData.append('req_time', reqtime);  // Add timestamp
    formData.append('merchant_id', MERCHANT_ID);            // Add merchant ID
    formData.append('tran_id', transationData[0].transactionid);
    formData.append('payment_option', 'abapay_khqr');
    formData.append('continue_success_url', type);
    formData.append('hash', hash);

    try {
        const response = await axios.post(CREATE_PAYMENT_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('response--payment--', response)
        console.log('response ---- url ----', response.request.res.responseUrl)

        const responseData = {
            status: response.status,
            statusText: response.statusText,
            data: response.data // Extract only the data part
        };

        await paymentTransationModal.findOneAndUpdate(
            { '_id': new mongoose.Types.ObjectId('66da8dfe5e5da894e55299eb') }, // Add criteria if needed
            { $inc: { transactionid: 1 } }, // Increment transactionid by 1
            { new: true } // Return the updated document
        );

        console.log('Payment Response:', responseData);
        res.json({ status: true, data: responseData, url: response.request.res.responseUrl, trans_id: transationData[0].transactionid });
    } catch (error) {
        console.error('Error during payment:', error);
    }
}

const getCurrentUTC = () => new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14);
const generateHash = (dataObject, publicKey) => {
    // Concatenate fields in the specified order
    const hashString = `${dataObject.req_time}${dataObject.merchant_id}${dataObject.tran_id}${dataObject.amount}${dataObject.payment_option}${dataObject.continue_success_url}${dataObject.currency}`;

    // Create HMAC SHA-512 hash and encode it as base64
    return crypto.createHmac('sha512', publicKey).update(hashString).digest('base64');
};

const generateQrHash = (dataObject, publicKey) => {
    const hashString = `${dataObject.req_time}${dataObject.merchant_id}${dataObject.tran_id}${dataObject.amount}${dataObject.payment_option}${dataObject.continue_success_url}${dataObject.currency}`;
    return crypto.createHmac('sha512', publicKey).update(hashString).digest('base64');
};

const generateCheckTransactionHash = (dataObject, secret) => {
    // Concatenate the relevant values to create the hash string
    const hashString = `${dataObject.requestTime}${dataObject.merchant_id}${dataObject.tran_id}`;

    // return crypto.createHmac('sha512', secret).update(hashString).digest('base64');

    // const hashString = `${dataObject.req_time}${dataObject.merchant_id}${dataObject.tran_id}${dataObject.amount}${dataObject.payment_option}${dataObject.continue_success_url}${dataObject.currency}`;

    // Create HMAC SHA-512 hash and encode it as base64
    return crypto.createHmac('sha512', secret).update(hashString).digest('base64');
};


const pushBackTransaction = async (req, res) => {
    const paymentStatus = req.body;
    console.log('pushBackTransaction', paymentStatus);
    const tran_id = paymentStatus.tran_id;
    const status = paymentStatus.status;
    const requestTime = getFormattedTimestamp();
    const secret = '366b35eb-433b-4d8e-8ee9-036bcd3e2e2c'; // Your secret key
    const hash = generateCheckTransactionHash({
        requestTime: requestTime,
        merchant_id: 'brandsandtalent', // Assuming this is a constant value
        tran_id: tran_id,
    }, secret);

    const form = new FormData();
    form.append('req_time', requestTime);
    form.append('merchant_id', 'brandsandtalent'); // Assuming this is a constant value
    form.append('tran_id', tran_id);
    form.append('hash', hash);

    try {
        const response = await axios.post(CHECK_TRANSACTION_URL, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response:', response.data.data.payment_status);
        const payment_status = response.data.data.payment_status;
        const transaction_date = response.data.data.transaction_date;
        const payment_currency = response.data.data.payment_currency;
        const payment_amount = response.data.data.payment_amount;
        console.log("payment_status", payment_status)
        if (payment_status == 'APPROVED') {

            // Find the transaction by tran_id in the transaction model
            const transaction = await transactionmodel.find({ transId: tran_id });
           
            if (!transaction) {
                return res.status(200).json({ message: 'Transaction not found' });

            }
            if (transaction[0].type === 'user') {
                if(transaction[0].coupon){
                console.log(" transaction.coupon ", transaction[0].coupon )

                // Find the coupon by its code
                const coupon = await couponmodel.findOne({ code: transaction[0].coupon });
                if (!coupon) {
                    return res.status(200).json({ status: false, message: 'Coupon not found' });
                }
                   
                // Attempt to find the user in each model
                const users = await kidsmodel.findOne({ _id: transaction[0].verifyId }) ||
                    await adultmodel.findOne({ _id: transaction[0].verifyId }) ||
                    await brandsmodel.findOne({ _id: transaction[0].verifyId });

                if (!users) {
                    return res.status(200).json({ status: false, message: 'User not found in any model' });
                }
             

                // Add the coupon details to the user's coupon array
                users.coupon.push({
                    code:  transaction[0].coupon ,
                    currency: coupon.currency,
                    discountAmount: coupon.discountAmount,
                    isActive: false,
                    expiry: coupon.expiry,
                    type: coupon.type,
                    couponId: coupon._id
                });

                // Save the updated user document
                await users.save();
               
                // Find the user associated with this transaction
                const user = await findUserByTransactionId(tran_id);
                if (!user) {
                    return res.status(200).json({ message: 'User not found' });
                }
                console.log("user", user)

               
                // Update the user with payment details
                user.paymentStatus = payment_status;
                user.paymentAmount = payment_amount;
                user.transactionDate = transaction_date;
                user.paymentCurreny = payment_currency;
                await user.save(); // Save the updated user
                console.log("user", user)

                // Send email notification
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: host,
                        pass: pass
                    }
                });

                const mailOptions = {
                    from: host,
                    to: transaction[0].email,
                    subject: 'Account Activated and Payment Successful',
                    html: `
                    <p>Dear User,</p>
                    <p>Your account has been successfully activated, and a payment of <strong>${user.paymentAmount} ${user.paymentCurreny}</strong> has been deducted from your account.</p>
                    <p>Thank you for your payment!</p>
                    <p>Best regards,</p>
                    <p><strong>Brands And Talent Team</strong></p>
        `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully');
                } catch (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Failed to send email' });
                }
                return res.status(200).json({ message: 'Transaction updated successfully', users });
            }
            else{
                console.log("else blockkkkk---------------------------")
                
                // Find the user associated with this transaction
                const user = await findUserByTransactionId(tran_id);
                if (!user) {
                    return res.status(200).json({ message: 'User not found' });
                }
                console.log("user", user)

               
                // Update the user with payment details
                user.paymentStatus = payment_status;
                user.paymentAmount = payment_amount;
                user.transactionDate = transaction_date;
                user.paymentCurreny = payment_currency;
                await user.save(); // Save the updated user
                console.log("user", user)

                // Send email notification
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: host,
                        pass: pass
                    }
                });

                const mailOptions = {
                    from: host,
                    to: transaction[0].email,
                    subject: 'Account Activated and Payment Successful',
                    html: `
                    <p>Dear User,</p>
                    <p>Your account has been successfully activated, and a payment of <strong>${user.paymentAmount} ${user.paymentCurreny}</strong> has been deducted from your account.</p>
                    <p>Thank you for your payment!</p>
                    <p>Best regards,</p>
                    <p><strong>Brands And Talent Team</strong></p>
        `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully');
                } catch (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Failed to send email' });
                }
                return res.status(200).json({ message: 'Transaction updated successfully', user });
            }

                
            } else if (transaction[0].type === 'gift') {
                console.log("gift................................")
                const giftId = transaction[0].verifyId;
                const email = transaction[0].email;

                // Fetch the matching gift item
                const giftcodes = await giftsubmodel.findOne(
                    { _id: giftId, 'gift.transId': tran_id },
                    { gift: { $elemMatch: { transId: tran_id } } } // Use $elemMatch for projection
                );

                console.log("giftcodes............", giftcodes)
                if (!giftcodes || giftcodes.gift.length === 0) {
                    return res.status(200).json({ message: 'Gift not found' });
                }

                const giftCode = giftcodes.gift[0].code;
               
                // Find the gift document
                const giftDoc = await giftsubmodel.findOne({ _id: giftId });
                if (!giftDoc) {
                    return res.status(200).json({ status: false, msg: 'Gift not found' });
                }

                console.log("giftDoc.........................", giftDoc)

                // Find the index of the gift in the array
                const itemIndex = giftDoc.gift.findIndex(g => g.code === giftCode);
                if (itemIndex === -1) {
                    return res.status(200).json({ status: false, msg: 'Gift item with the specified code not found' });
                }
              

                // Find the coupon with type 'free code'
                const coupon = await couponmodel.findOne({ type: 'free code'});//subscriptionPlan:req.body.subscriptionPlan,planName:req.body.planName 
                if (!coupon) {
                    return res.status(200).json({ status: false, message: 'Free code coupon not found' });
                }
             

                // Prepare the fields to be updated
                const updatedFields = {
                    [`gift.${itemIndex}.coupon`]: coupon.code,
                    [`gift.${itemIndex}.expiry`]: coupon.expiry,
                    [`gift.${itemIndex}.receiversFirstName`]: req.body.gift?.[0]?.receiversFirstName || giftDoc.gift[itemIndex].receiversFirstName,
                    [`gift.${itemIndex}.receiverEmail`]: req.body.gift?.[0]?.receiverEmail || giftDoc.gift[itemIndex].receiverEmail,
                    [`gift.${itemIndex}.message`]: req.body.gift?.[0]?.message || giftDoc.gift[itemIndex].message,
                    [`gift.${itemIndex}.subscriptionPlan`]: req.body.gift?.[0]?.subscriptionPlan || giftDoc.gift[itemIndex].subscriptionPlan,
                    [`gift.${itemIndex}.planName`]: req.body.gift?.[0]?.planName || giftDoc.gift[itemIndex].planName,
                    [`gift.${itemIndex}.paymentStatus`]: payment_status,
                    [`gift.${itemIndex}.transId`]: tran_id,
                    [`gift.${itemIndex}.transactionDate`]: transaction_date,
                    [`gift.${itemIndex}.paymentCurrency`]: payment_currency,
                    [`gift.${itemIndex}.paymentAmount`]: payment_amount,
                };
              

                // Update the gift document in the giftsubmodel collection

                const result = await giftsubmodel.findByIdAndUpdate(giftId, { $set: updatedFields }, { new: true });
                

                const user = await findUserByEmail(email);
                if (!user) {
                    return res.status(200).json({ status: false, msg: 'User not found' });
                }
               
                const userUpdateFields = {
                    senderName: transaction[0].senderName,
                    email: email,
                    user_id: user._id,
                    userType: user.modelName, // Automatically determines the user model (Kids, Adults, Brands)
                    gift: result.gift, // Updated gift array
                    isActive: true,
                };

                await user.constructor.updateOne({ _id: user._id }, { $set: userUpdateFields });
                const expiryDate = coupon.expiry;

                // Send email notifications
                await sendGiftEmailNotifications(coupon, giftCode, expiryDate, giftcodes, transaction);

                res.json({ status: true, msg: 'Updated successfully' });
            }

        } else {
            res.status(200).json({ message: 'Payment not approved' });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, msg: err.message || 'Error Occurred' });
    }
};

// Helper function to find the user by transaction ID
const findUserByTransactionId = async (tran_id) => {
    // Adjust the query logic based on your database structure
    let user = await kidsmodel.findOne({ transId: tran_id });
    if (!user) {
        user = await adultmodel.findOne({ transId: tran_id });
    }
    if (!user) {
        user = await brandsmodel.findOne({ transId: tran_id });
    }
    return user;
};
// Helper function to find a user by email
const findUserByEmail = async (email) => {
    let user = await kidsmodel.findOne({ parentEmail: email });
    if (!user) {
        user = await adultmodel.findOne({ adultEmail: email });
    }
    if (!user) {
        user = await brandsmodel.findOne({ brandEmail: email });
    }
    return user;
};



// Helper function to send email notifications
const sendGiftEmailNotifications = async (coupon, giftCode, expiryDate, giftcodes, transaction) => {
    console.log("senderName", transaction);
    const receiverEmail = giftcodes.gift[0].receiverEmail;
    const receiversFirstName = giftcodes.gift[0].receiversFirstName;
    const senderName = transaction[0].senderName || 'Brands and Talent Team';
    const senderEmail = transaction[0].email;

    const mailOptions = {
        from: host,
        to: receiverEmail,
        subject: 'Gift Received',
       
        html: `<p>Hi ${receiversFirstName}!</p>
        <p>Warm wishes from the BT team!</p>
        <p>${senderName} has sent you a gift! 🎁 You can now enjoy access to our BT web application with your gifted ${giftcodes.gift[0].planName} ${giftcodes.gift[0].subscriptionPlan} subscription</p>
        <p>Make sure to apply the coupon <strong>${coupon.code}</strong> before <strong>${expiryDate}</strong>.</p>
        <p>${senderName} has a message for you: <strong>"${giftcodes.gift[0].message}!"</strong></p>
        <p>Visit <strong><a href="https://brandsandtalent.com/">brandsandtalent.com</a></strong> to create your profile!</p>`
    };
    await transporter.sendMail(mailOptions);

    const senderMailOptions = {
        from: host,
        to: senderEmail,
        subject: 'Gift Sent Successfully',
        html: `
        <p>Dear ${senderName},</p>
        <p>We are pleased to confirm that you have successfully sent a coupon to: <strong>${receiversFirstName}</strong>.</p>
        <p>This coupon code will activate a ${giftcodes.gift[0].planName} ${giftcodes.gift[0].subscriptionPlan} membership in the BT web application for your friend.</p>
        <p>Please note that  <strong>${coupon.code}</strong>  is valid until ${expiryDate}.</p>
        <p>Thank you for your generosity in gifting with Brands & Talent!</p>
        <p>Best regards,<br/> The Brands And Talent Team</p>
      `,
    };
    await transporter.sendMail(senderMailOptions);
};





module.exports = {
    addPricing, pricingList, addBrandsPricing, brandsPricingList, createPayment, checkTransaction, createQrPayment, pushBackTransaction
};