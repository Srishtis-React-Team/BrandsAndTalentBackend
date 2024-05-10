
var express = require('express');
var router = express.Router();

const price = require('../controllers/pricing')
router.post('/addPricing',price.addPricing)
router.get('/pricingList',price.pricingList)
router.post('/addBrandsPricing',price.addBrandsPricing)
router.get('/brandsPricingList',price.brandsPricingList)



module.exports = router






