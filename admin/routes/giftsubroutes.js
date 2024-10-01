const express = require('express');
const router = express.Router();
const giftsub = require('../controllers/giftsub');



router.post('/giftSubCreation', giftsub.giftSubCreation);
router.get('/getGiftSubscriptions', giftsub.getGiftSubscriptions);
router.post('/getGiftSubscriptionsByUser', giftsub.getGiftSubscriptionsByUser);
router.post('/updateGift', giftsub.updateGift);


module.exports = router;
