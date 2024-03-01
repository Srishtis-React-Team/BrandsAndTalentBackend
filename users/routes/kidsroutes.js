
var express = require('express');
var router = express.Router();

const users = require('../controllers/kids')
router.post('/kidsSignUp',users.kidsSignUp)//for kids sign up
router.post('/adultSignUp',users.adultSignUp)//for adultSignUp
router.post('/talentLogin',users.talentLogin)//for user login
router.post('/adultFetch/:user_id',users.adultFetch)//adultFetch
router.post('/kidsFetch/:user_id',users.kidsFetch)//for kidsFetch
router.post('/forgotPassword',users.forgotPassword)//for forgotPassword
router.post('/resetPassword',users.resetPassword)//for resetPassword
router.post('/updateAdults/:user_id',users.updateAdults)//for editUser
router.post('/deleteUser/:user_id',users.deleteUser)//for deleteUser
router.post('/otpVerification',users.otpVerification)//for otpVerification
router.post('/subscriptionPlan',users.subscriptionPlan)//for subscriptionPlan
router.post('/otpVerificationAdult',users.otpVerificationAdult)//for otpVerificationAdult
router.post('/editKids/:user_id',users.editKids)//for editKids
router.post('/unifiedDataFetch/:user_id/:dataType',users.unifiedDataFetch)//for kidsDataFetch
router.post('/deleteFile/:user_id',users.deleteFile)//for deleteFile
router.post('/otpResend',users.otpResend)//for otpResend
router.post('/otpResendAdult',users.otpResendAdult)//for otpResendAdult
router.get('/talentList',users.talentList)//for talentList
router.post('/talentFilterData/:user_id',users.talentFilterData)//for talentFilterData
router.post('/setUserFavorite/:user_id',users.setUserFavorite)//for talentFilterData
router.get('/searchTalent',users.searchTalent)//for searchTalent
router.post('/checkProfileStatus/:user_id',users.checkProfileStatus)//for checkProfileStatus



module.exports = router






