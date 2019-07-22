'use strict'

const express = require('express')
const router = express.Router()
const userDetailsController = require('../app/api/controllers/userDetails.controllers')
const partnersController = require('../app/api/controllers/partners.controllers')
const { multerUploads } = require('../app/api/middleware/multer.middleware')

const auth = require('../app/api/middleware/auth')

router.get('/details/user', auth, userDetailsController.get)
router.get('/details/partner', auth, partnersController.getAll)
router.patch('/details/user', auth, multerUploads, userDetailsController.updateProfile)

module.exports = router