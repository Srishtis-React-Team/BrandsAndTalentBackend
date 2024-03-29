const express = require('express');
const router = express.Router();
const features = require('../controllers/features'); // Adjust the path as necessary
// Import the function and middleware
//const { FileUploadMultiple, multipleUpload } = require('./fileUploadHandler');


router.post('/addFeatures', features.addFeatures);
router.get('/getFeatures', features.getFeatures);
 router.post('/FileUploadMultiple',features.upload.array("files"),features.FileUploadMultiple)
module.exports = router;
