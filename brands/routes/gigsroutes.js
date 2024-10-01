var express = require('express');
var router = express.Router();

const gigs = require('../controllers/gigs')
router.post('/createJob',gigs.createJob)//for createJob
router.post('/getPostedJobs',gigs.getPostedJobs)//for getPostedJobs
router.get('/getJobsByID/:gigId',gigs.getJobsByID)//for getAllJobs
router.post('/draftJob',gigs.draftJob)//for draftJob
router.get('/getDraftJobsByID/:gigId',gigs.getDraftJobsByID)//for getDraftJobsByID
router.get('/getDraftJobs',gigs.getDraftJobs)//for getDraftJobs
router.post('/postJobByDraft/:gigId',gigs.postJobByDraft)
router.post('/editJob/:gigId',gigs.editJob)
router.post('/editDraft/:gigId',gigs.editDraft)
router.get('/getBrandPostedJobsByID/:brandId',gigs.getBrandPostedJobsByID)//for getBrandPostedJobsByID
router.get('/getBrandDraftJobsByID/:brandId',gigs.getBrandDraftJobsByID)//for getBrandPostedJobsByID
router.get('/getAllJobs/:userId',gigs.getAllJobs)//for getAllJobs
router.post('/deleteJob',gigs.deleteJob)//for deleteJob
router.get('/getAnyJobById/:gigId',gigs.getAnyJobById)//for getAnyJobById
router.post('/jobCount/:brandId',gigs.jobCount)//for jobCount
router.post('/searchJobs',gigs.searchJobs)//for searchJobs
router.post('/applyJobs',gigs.applyJobs)//for applyJobs
router.post('/readNotification',gigs.readNotification)//for readNotification
router.get('/getBrandNotification/:brandId',gigs.getBrandNotification)//for getBrandNotification
router.get('/getTalentNotification/:talentId',gigs.getTalentNotification)//for getBrandNotification
router.post('/getCountNotification',gigs.getCountNotification)//for getCountNotification
router.post('/getAppliedjobs',gigs.getAppliedjobs)//for getAppliedjobs
router.post('/selectedLevelRange',gigs.selectedLevelRange)//for selectedLevelRange
router.post('/informSelectedLevel',gigs.informSelectedLevel)//for informSelectedLevel
router.post('/newCandidates',gigs.newCandidates)//for newCandidates
router.post('/saveUser',gigs.saveUser)//for saveUser
router.get('/fetchUser',gigs.fetchUser)//for fetchUser
router.post('/getSelectionList',gigs.getSelectionList)//for getSelectionList
router.post('/updateFavouriteJobs',gigs.updateFavouriteJobs)//for updateFavouriteJobs
router.post('/getSavedJobsByTalentId',gigs.getSavedJobsByTalentId)//for getSavedJobsByTalentId
router.get('/getSkills',gigs.getSkills)//for getSkills
router.post('/removeFavouritesJob',gigs.removeFavouritesJob)//for removeFavouritesJob
router.post('/updatePassword',gigs.updatePassword)//for updatePassword
router.post('/getNotification',gigs.getNotification)//for getNotification
router.post('/createJobAlert',gigs.createJobAlert)//for createJobAlert
router.post('/updateJobAlert',gigs.updateJobAlert)//for updateJobAlert
router.post('/inviteTalentToApply',gigs.inviteTalentToApply)//for inviteTalentToApply
router.post('/isApprovedForjobByPlan',gigs.isApprovedForjobByPlan)//for isApprovedForjobByPlan
router.get('/getBrandJobs/:brandId',gigs.getBrandJobs)//for getBrandJobs
router.get('/getAllNotification',gigs.getAllNotification)//for getAllNotification
router.post('/inviteTalentNotification',gigs.inviteTalentNotification)//for inviteTalentNotification



module.exports = router