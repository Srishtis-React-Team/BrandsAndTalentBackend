const express = require('express');
const router = express.Router();
const features = require('../controllers/features'); // Adjust the path as necessary



router.post('/addFeatures', features.addFeatures);
router.get('/getFeatures', features.getFeatures);
 router.post('/FileUploadMultiple',features.upload.array("files"),features.FileUploadMultiple)
module.exports = router;
