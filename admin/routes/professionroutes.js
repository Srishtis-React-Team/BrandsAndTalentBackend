
var express = require('express');
var router = express.Router();

const profession = require('../controllers/profession')
router.post('/addProfession',profession.addProfession)
router.get('/professionList',profession.professionList)



module.exports = router