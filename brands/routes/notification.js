var express = require('express');
var router = express.Router();

const notification = require('../controllers/notification')
router.post('/addMessage',notification.addMessage)//for addMessage




module.exports = router