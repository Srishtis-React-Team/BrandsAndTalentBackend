var express = require('express');
var router = express.Router();

const brands = require('../controllers/brands')
router.post('/brandsRegister',brands.brandsRegister)//for brandsRegister
router.post('/brandsLogin',brands.brandsLogin)//for brandsLogin
router.post('/login',brands.login)//for brandsLogin


module.exports = router