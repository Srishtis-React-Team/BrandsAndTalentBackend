const express = require('express');
const router = express.Router();
const features = require('../controllers/features'); // Adjust the path as necessary
// Import the function and middleware
//const { FileUploadMultiple, multipleUpload } = require('./fileUploadHandler');


router.post('/addFieldDatas', features.addFieldDatas);
router.post('/getFieldDatas', features.getFieldDatas);
 router.post('/FileUploadMultiple',features.upload.array("files"),features.FileUploadMultiple)
 router.post('/updateFieldDatas', features.updateFieldDatas);
 router.post('/deleteFieldDatas', features.deleteFieldDatas);
 router.get('/getAllDatas', features.getAllDatas);
 

 
module.exports = router;
