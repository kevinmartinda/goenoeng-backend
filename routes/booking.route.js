'use strict'

const express = require('express')
const router = express.Router()
const bookingTransaction = require('../app/api/controllers/booking.controller')

const auth = require('../app/api/middleware/auth')

router.get('/', auth, bookingTransaction.findAllUserBooking)
router.post('/', auth, bookingTransaction.create)

module.exports = router