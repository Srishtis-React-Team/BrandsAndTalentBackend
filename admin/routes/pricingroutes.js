
var express = require('express');
var router = express.Router();

const price = require('../controllers/pricing')
router.post('/addPricing',price.addPricing)
router.get('/pricingList',price.pricingList)
router.post('/addBrandsPricing',price.addBrandsPricing)
router.get('/brandsPricingList',price.brandsPricingList)
router.post('/create-payment',price.createPayment);
router.post('/check-transaction',price.checkTransaction);
router.post('/createqrpayment',price.createQrPayment);
router.post('/pushbacktransaction',price.pushBackTransaction);


module.exports = router






