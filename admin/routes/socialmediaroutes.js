
var express = require('express');
var router = express.Router();


const socialmedia = require('../controllers/socialmedia')

router.post('/instagramCount',socialmedia.instagramCount)
router.post('/twitterCount',socialmedia.twitterCount)
router.post('/facebookCount',socialmedia.facebookCount);
router.post('/youtubeCount',socialmedia.youtubeCount);

module.exports = router