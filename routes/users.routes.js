'use strict'

const express = require('express')
const router = express.Router()
const userController = require('../app/api/controllers/users.controllers')

const auth = require('../app/api/middleware/auth')

router.post('/register', userController.signup)
router.post('/auth/:level', userController.login)
//router.post('/forgetpassword', userController.forgetPassword)
router.patch('/changepassword/:level', auth, userController.changePassword)

module.exports = router