var express = require('express');
var router = express.Router();

const brands = require('../controllers/brands')
router.post('/brandsRegister',brands.brandsRegister)//for brandsRegister



module.exports = router