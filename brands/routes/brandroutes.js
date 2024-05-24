var express = require('express');
var router = express.Router();

const brands = require('../controllers/brands')
router.post('/brandsRegister',brands.brandsRegister)//for brandsRegister
router.post('/brandsLogin',brands.brandsLogin)//for brandsLogin
//router.post('/login',brands.login)//for brandsLogin
router.post('/editBrands/:user_id',brands.editBrands)//for editBrands
router.post('/deleteBrands/:user_id',brands.deleteBrands)//for deleteBrands
router.get('/getBrandById/:user_id',brands.getBrandById)//for brandsProfile
router.post('/topBrands',brands.topBrands)//for topBrands
router.post('/otpVerificationBrands',brands.otpVerificationBrands)//for otpVerificationBrands
router.get('/favouritesList',brands.favouritesList)//for favouritesList
router.post('/searchDatas',brands.searchDatas)//for searchDatas
router.post('/socailSignUpBrands',brands.socailSignUpBrands)//for socailSignUpBrands
router.post('/brandsResetPassword',brands.brandsResetPassword)//for brandsResetPassword
router.post('/brandsForgotPassword',brands.brandsForgotPassword)//for brandsForgotPassword
router.get('/getBrands',brands.getBrands)//for getBrands
router.post('/deleteNotification',brands.deleteNotification)//for deleteNotification
router.post('/updatePasswordInSettings',brands.updatePasswordInSettings)//for updatePasswordInSettings
router.post('/activateBrandUser',brands.activateBrandUser)//for activateBrandUser

module.exports = router