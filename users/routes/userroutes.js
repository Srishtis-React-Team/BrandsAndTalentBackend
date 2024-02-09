
var express = require('express');
var router = express.Router();

const users = require('../controllers/users')
router.post('/addUsers',users.addUsers)//for user register
router.post('/userLogin',users.userLogin)//for user login
router.post('/userProfile/:user_id',users.userProfile)//for user login
router.post('/forgotPassword',users.forgotPassword)//for forgotPassword
router.post('/resetPassword',users.resetPassword)//for resetPassword
router.post('/editUser/:user_id',users.editUser)//for editUser
router.post('/deleteUser/:user_id',users.deleteUser)//for deleteUser
router.post('/userFetch/:user_id',users.userFetch)//for userFetch



module.exports = router






