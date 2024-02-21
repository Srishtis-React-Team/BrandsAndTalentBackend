
var express = require('express');
var router = express.Router();

const admin = require('../controllers/admin')
router.post('/addAdmin',admin.addAdmin)//for admin register
router.post('/adminLogin',admin.adminLogin)//for admin login
router.post('/adminProfile/:user_id',admin.adminProfile)//for admin login
router.post('/forgotPassword',admin.forgotPassword)//for forgotPassword
router.post('/resetPassword',admin.resetPassword)//for resetPassword
router.post('/fileUpload',admin.uploads.single("file"),admin.fileUpload) //File Upload Single Image
router.post('/addCountry',admin.addCountry)
router.post('/listCity',admin.listCity)
router.post('/listState',admin.listState)
router.post('/adminFetch',admin.adminFetch)
router.post('/listLocation',admin.listLocation)
router.get('/listCountries',admin.listCountries)


module.exports = router






