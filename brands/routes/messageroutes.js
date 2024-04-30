var express = require('express');
var router = express.Router();

const message = require('../controllers/message')
router.post('/addMessage',message.addMessage)//addMessage 
router.post('/listMessage',message.listMessage)//listMessage 
router.post('/listTalentsForChat',message.listTalentsForChat)//listTalentsForChat 
router.get('/listBrandsForChat',message.listBrandsForChat)//listBrandsForChat 
router.post('/createMessage',message.createMessage)//createMesssage 
router.get('/getMessages/:chatId',message.getMessages)//getMessages 
router.post('/getMessageByUser',message.getMessageByUser)//getMessageByUser
module.exports = router