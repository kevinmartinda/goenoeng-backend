'use strict'

const express = require('express')
const router = express.Router()
const partnersController = require('../app/api/controllers/partners.controllers')
const { multerUploads } = require('../app/api/middleware/multer.middleware')

const auth = require('../app/api/middleware/auth')

router.get('/details', auth, partnersController.getFind)
router.post('/add/:id', auth, multerUploads, partnersController.add)

module.exports = router