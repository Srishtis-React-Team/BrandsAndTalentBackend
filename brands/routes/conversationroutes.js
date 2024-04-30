var express = require('express');
var router = express.Router();

const conversation = require('../controllers/conversation')
router.post('/addConversation',conversation.addConversation)//Addconversation 
router.post('/listBrandChat',conversation.listBrandChat)//listBrandChat 
router.post('/listTalentChat',conversation.listTalentChat)//listTalentChat 
router.post('/listBrandsAndTalent',conversation.listBrandsAndTalent)//listBrandsAndTalent Admin woth user or negotiator
router.post('/conversationByUserId',conversation.conversationByUserId)//conversationByUserId 
router.post('/listByConversationId',conversation.listByConversationId)//listByConversationId 
router.post('/listByConersationOfTwoUsers',conversation.listByConersationOfTwoUsers)//listByConersationOfTwoUsers 

module.exports = router






