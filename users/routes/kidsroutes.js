
var express = require('express');
var router = express.Router();

const users = require('../controllers/kids')
router.post('/kidsSignUp',users.kidsSignUp)//for kids sign up
router.post('/adultSignUp',users.adultSignUp)//for adultSignUp
router.post('/kidsLogin',users.kidsLogin)//for user login
router.post('/adultLogin',users.adultLogin)//for adultLogin
router.post('/adultFetch/:user_id',users.adultFetch)//adultFetch
router.post('/kidsFetch/:user_id',users.kidsFetch)//for kidsFetch
router.post('/forgotPassword',users.forgotPassword)//for forgotPassword
router.post('/resetPassword',users.resetPassword)//for resetPassword
router.post('/editAdult/:user_id',users.editAdult)//for editUser
router.post('/deleteUser/:user_id',users.deleteUser)//for deleteUser
router.post('/otpVerification',users.otpVerification)//for otpVerification
router.post('/subscriptionPlan',users.subscriptionPlan)//for subscriptionPlan
router.post('/otpVerificationAdult',users.otpVerificationAdult)//for subscriptionPlan
router.post('/editKids/:user_id',users.editKids)//for subscriptionPlan
router.post('/kidsDataFetch/:user_id/:dataType',users.kidsDataFetch)//for subscriptionPlan




module.exports = router






