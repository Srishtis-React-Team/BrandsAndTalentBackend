var express = require('express');
var router = express.Router();

const features = require('../controllers/features')
router.post('/addFeatures',features.addFeatures)
router.get('/getFeatures',features.getFeatures)



module.exports = router