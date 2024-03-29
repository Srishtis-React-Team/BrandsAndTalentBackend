var express = require('express');
var router = express.Router();

const reviews = require('../controllers/reviews')
router.post('/addReviews',reviews.addReviews)//for addReviews
router.get('/reviewList',reviews.reviewList)//for reviewList


module.exports = router