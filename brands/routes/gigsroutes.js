var express = require('express');
var router = express.Router();

const gigs = require('../controllers/gigs')
router.post('/createJob',gigs.createJob)//for createJob
router.get('/getPostedJobs',gigs.getPostedJobs)//for getPostedJobs
router.get('/getJobsByID/:gigId',gigs.getJobsByID)//for getAllJobs
router.post('/draftJob',gigs.draftJob)//for draftJob
router.get('/getDraftJobsByID/:gigId',gigs.getDraftJobsByID)//for getDraftJobsByID
router.get('/getDraftJobs',gigs.getDraftJobs)//for getDraftJobs
router.post('/postJobByDraft/:gigId',gigs.postJobByDraft)
router.post('/editJob/:gigId',gigs.editJob)
router.post('/editDraft/:gigId',gigs.editDraft)
router.get('/getBrandPostedJobsByID/:brandId',gigs.getBrandPostedJobsByID)//for getBrandPostedJobsByID
router.get('/getBrandDraftJobsByID/:brandId',gigs.getBrandDraftJobsByID)//for getBrandPostedJobsByID
router.get('/getAllJobs',gigs.getAllJobs)//for getAllJobs
router.post('/deleteJob',gigs.deleteJob)//for deleteJob
router.get('/getAnyJobById/:gigId',gigs.getAnyJobById)//for getAnyJobById


module.exports = router