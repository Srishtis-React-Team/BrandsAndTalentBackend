var express = require('express');
var router = express.Router();

const brands = require('../controllers/brands')
router.post('/brandsRegister',brands.brandsRegister)//for brandsRegister
router.post('/brandsLogin',brands.brandsLogin)//for brandsLogin
//router.post('/login',brands.login)//for brandsLogin
router.post('/editBrands/:user_id',brands.editBrands)//for editBrands
router.post('/deleteBrands/:user_id',brands.deleteBrands)//for deleteBrands
router.post('/brandsProfile/:user_id',brands.brandsProfile)//for brandsProfile

module.exports = router