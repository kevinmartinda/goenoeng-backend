'use strict'

const express = require('express')
const router = express.Router()
const rentalTransactionController = require('../app/api/controllers/rentalTransaction.controller')

const auth = require('../app/api/middleware/auth')

router.get('/', auth, rentalTransactionController.findAllUserTransaction)
router.post('/', auth, rentalTransactionController.create)
router.patch('/:id', auth, rentalTransactionController.update)

module.exports = router