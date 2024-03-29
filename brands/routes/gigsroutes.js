var express = require('express');
var router = express.Router();

const gigs = require('../controllers/gigs')
router.post('/createJob',gigs.createJob)//for createJob
router.get('/getAllJobs',gigs.getAllJobs)//for getAllJobs
router.get('/getJobsByID/:gigId',gigs.getJobsByID)//for getAllJobs


module.exports = router