var express = require('express');
var router = express.Router();

const chat = require('../controllers//chat')
 
router.post('/findUserChats/:userId',chat.findUserChats)//findUserChats 
router.get('/findChat/:firstId/:secondId',chat.findChat)//findChat 
router.post('/createChat',chat.createChat)//createChat
router.post('/findPreviousChatUsers/:userId',chat.findPreviousChatUsers)//findPreviousChatUsers



module.exports = router






