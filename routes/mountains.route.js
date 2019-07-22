'use strict'

const express = require('express')
const router = express.Router()
const mountainsController = require('../app/api/controllers/mountains.controller')

// middleware
const { multerUploads } = require('../app/api/middleware/multer.middleware')

router.get('/', mountainsController.findAll)
router.get('/:id', mountainsController.findById)
router.post('/', multerUploads, mountainsController.create)
router.patch('/:id', multerUploads, mountainsController.update)
router.delete('/:id', mountainsController.delete)

module.exports = router
