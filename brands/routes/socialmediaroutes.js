var express = require('express');
var router = express.Router();

const socialmedia = require('../controllers/socialmedia')
router.get('/getUserIdByUsername',socialmedia.getUserIdByUsername)
router.get('/getUserDetailsById',socialmedia.getUserDetailsById)
router.get('/getUserDetails',socialmedia.getUserDetails)
router.get('/getInstagramaccount/:page',socialmedia.getInstagramaccount)

module.exports = router