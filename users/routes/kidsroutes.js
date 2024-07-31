
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
router.post('/talentFilterData',users.talentFilterData)//for talentFilterData
router.post('/setUserFavorite/:user_id',users.setUserFavorite)//for talentFilterData
router.get('/searchTalent',users.searchTalent)//for searchTalent
router.post('/checkProfileStatus/:user_id',users.checkProfileStatus)//for checkProfileStatus
router.post('/getTalentById/:user_id',users.getTalentById)//for searchTalent
router.post('/updateProfileStatus/:user_id',users.updateProfileStatus)//for updateProfileStatus
router.post('/subscriptionStatus',users.subscriptionStatus)//for subscriptionStatus
router.post('/getByProfession',users.getByProfession)//for subscriptionStatus
router.post('/loginTemplate',users.loginTemplate)//for loginTemplate
router.get('/getPlanByType/:userId',users.getPlanByType)//for getPlanByType
router.post('/removeFavorite/:user_id',users.removeFavorite)//for removeFavorite
router.post('/checkUserStatus',users.checkUserStatus)//for checkUserStatus
router.post('/socialSignup',users.socialSignup)//for googleSignUpAdult
router.post('/updateAdultPassword',users.updateAdultPassword)//for updateAdultPassword
router.post('/adultForgotPassword',users.adultForgotPassword)//for adultForgotPassword
router.post('/adultResetPassword',users.adultResetPassword)//for adultResetPassword
router.post('/fetchUserData/:user_id',users.fetchUserData)//for fetchUserData
router.get('/countUsers',users.countUsers)//for countUsers
router.post('/activateUser/:user_id',users.activateUser)//for activateUser
router.post('/deleteService',users.deleteService)//for deleteService
router.post('/addServices',users.addServices)//for addServices
router.post('/applyJobUsersList',users.applyJobUsersList)//for applyJobUsersList
router.post('/deleteIndividualService',users.deleteIndividualService)//for deleteIndividualService
router.post('/typeChecking',users.typeChecking)//for typeChecking
router.post('/reviewsPosting',users.reviewsPosting)//for reviewsPosting
router.post('/deleteVideoUrls',users.deleteVideoUrls)//for deleteVideoUrls
router.post('/reportReview',users.reportReview)//for reportReview
router.post('/getDataByPublicUrl',users.getDataByPublicUrl)//for getDataByPublicUrl

module.exports = router






