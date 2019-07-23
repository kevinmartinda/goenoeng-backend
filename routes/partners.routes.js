'use strict'

const express = require('express')
const router = express.Router()
const partnersController = require('../app/api/controllers/partners.controllers')
const { multerUploads } = require('../app/api/middleware/multer.middleware')

const auth = require('../app/api/middleware/auth')

router.get('/', partnersController.getAll)
router.get('/:id', partnersController.getOne)
router.get('/details', auth, partnersController.getFind)
router.post('/add', auth, multerUploads, partnersController.add)

module.exports = router