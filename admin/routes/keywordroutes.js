const express = require('express');
const router = express.Router();
const keyword = require('../controllers/keyword');



router.post('/postUserSearchKeyword', keyword.postUserSearchKeyword);
router.get('/getUserSearchKeyword/:user_id', keyword.getUserSearchKeyword);
router.post('/deleteUserSearchKeyword', keyword.deleteUserSearchKeyword);

module.exports = router;
