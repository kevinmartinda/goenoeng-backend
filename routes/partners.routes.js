'use strict'

const express = require('express')
const router = express.Router()
const partnersController = require('../app/api/controllers/partners.controllers')
const { multerUploads } = require('../app/api/middleware/multer.middleware')

const auth = require('../app/api/middleware/auth')

router.get('/', partnersController.getAll)
router.patch('/', auth, multerUploads, partnersController.updatePartner)
router.get('/partner/:id', partnersController.getOne)

router.get('/mountain/:id', partnersController.getroductByMountain)

router.get('/partner/:id/product/:idProduct', partnersController.getOneProduct)

router.get('/details', auth, partnersController.getFind)

router.post('/product/add', auth, multerUploads, partnersController.add)
router.patch('/product/:id', auth, partnersController.updateProduct)
router.delete('/product/:id', auth, partnersController.deleteProduct)

module.exports = router