
var express = require('express');
var router = express.Router();


const coupon = require('../controllers/coupon')
router.post('/couponGeneration',coupon.couponGeneration)//for couponGeneration
router.get('/activeCoupons',coupon.activeCoupons)//for activeCoupons
router.post('/applyCoupon',coupon.applyCoupon)//for applyCoupon
router.post('/editCoupon',coupon.editCoupon)//for editCoupon
router.post('/deleteCoupon',coupon.deleteCoupon)//for deleteCoupon


module.exports = router






