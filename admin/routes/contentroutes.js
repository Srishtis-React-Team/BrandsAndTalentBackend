
var express = require('express');
var router = express.Router();


const content = require('../controllers/content')
router.post('/addContent',content.addContent)//for admin register
router.post('/fetchContentByType',content.fetchContentByType)//for fetchContentByType
router.post('/editContent',content.editContent)//for editContent
router.post('/deleteContent',content.deleteContent)//for deleteContent




module.exports = router






