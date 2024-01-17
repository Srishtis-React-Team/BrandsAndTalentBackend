
var express = require('express');
var router = express.Router();

const admin = require('../controllers/admin')
router.post('/addAdmin',admin.addAdmin)//for admin register
router.post('/adminLogin',admin.adminLogin)//for admin login
router.post('/adminProfile/:user_id',admin.adminProfile)//for admin login
router.post('/forgotPassword',admin.forgotPassword)//for forgotPassword
router.post('/resetPassword',admin.resetPassword)//for resetPassword
router.post('/imageUpload',admin.uploads.single("file"),admin.imageUpload) //File Upload Single Image
router.post('/listCountry',admin.listCountry)
router.post('/listCity',admin.listCity)
router.post('/listState',admin.listState)
router.post('/adminFetch',admin.adminFetch)


module.exports = router






