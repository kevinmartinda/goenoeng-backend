'use strict'

const express = require('express')
const router = express.Router()
const userDetailsController = require('../app/api/controllers/userDetails.controllers')
const { multerUploads } = require('../app/api/middleware/multer.middleware')

const auth = require('../app/api/middleware/auth')

router.get('/details', auth, userDetailsController.get)
router.get('/details/:id', userDetailsController.getOne)
router.patch('/details', auth, multerUploads, userDetailsController.updateProfile)

module.exports = router