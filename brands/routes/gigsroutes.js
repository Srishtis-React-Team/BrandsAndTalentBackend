var express = require('express');
var router = express.Router();

const gigs = require('../controllers/gigs')
router.post('/addGigs',gigs.addGigs)//for addGigs
router.get('/recentGigs',gigs.recentGigs)//for recentGigs


module.exports = router