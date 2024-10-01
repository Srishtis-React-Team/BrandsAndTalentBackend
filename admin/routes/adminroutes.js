
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
router.post('/chatbot',admin.chatbot)
router.get('/getAllStatesList',admin.getAllStatesList)
router.get('/getAllCitiesList',admin.getAllCitiesList)// Assuming admin.multiUploads is your multer configuration,
router.post('/adminApproval',admin.adminApproval)//for adminApproval
router.post('/jobApproval',admin.jobApproval)//for jobApproval
router.get('/notApprovedMembers',admin.notApprovedMembers)//for notApprovedMembers
router.get('/ListBrandForJobPost',admin.ListBrandForJobPost)//for ListBrandForJobPost
//router.post('/filterByApprovalType',admin.filterByApprovalType)//for filterByApprovalType
router.post('/filterByStatus',admin.filterByStatus)//for filterByStatus
router.post('/jobApprovalByBrandsList',admin.jobApprovalByBrandsList)//for jobApprovalByBrandsList
router.post('/adminApprovalByList',admin.adminApprovalByList)//for adminApprovalByList
router.post('/profileApproval',admin.profileApproval)//for profileApproval
router.post('/bellIconCount',admin.bellIconCount)//for bellIconCount
router.post('/readNotification',admin.readNotification)//for readNotification
router.post('/giftMail',admin.giftMail)//for giftMail
router.post('/payment',admin.payment)//for createTransaction
router.post('/checkTransaction',admin.checkTransaction)//for checkTransaction
router.post('/reviewApproval',admin.reviewApproval)//for reviewApproval
router.post('/addSuccessStories',admin.addSuccessStories)//for addsuccessstories  
router.get('/getSuccessStories',admin.getSuccessStories)//for getSuccessStories                        
router.get('/getLogos',admin.getLogos)//for getLogos  
router.post('/addLogo',admin.addLogo)//for addLogo  
router.post('/addImageToLogo',admin.addImageToLogo)//for addImageToLogo  
router.post('/deleteImageFromLogo',admin.deleteImageFromLogo)//for deleteImageFromLogo 


module.exports = router






