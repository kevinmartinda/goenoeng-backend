'use strict'

const stripe = require('stripe')(process.env.STRIPE_TEST_KEY)

const bookingModel = require('../models/booking.model')
const mountainModel = require('../models/mountains.model')

const sendNotification = require('../middleware/sendNotification.lib')

const { client, deleteKey } = require('../middleware/redis.middleware')

exports.findAllUserBooking = async (req, res) => {

    const key = 'booking-get:all'

    return client.get(key, async (err, reply) => {
        if (reply) {
          return res.json({ source: 'cache', status: 200, data: JSON.parse(reply) })
        } else {
            await bookingModel.find({
                user: req.user._id
            }).populate({path:'user', select: ['_id', 'name']}).populate('mountain')
                    .then(data => {
                        client.setex(key, 3600, JSON.stringify(data))
                        res.json({
                            status: 200,
                            data
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            status: 500,
                            message: err.message || 'same error'
                        })
                    })
        
        }
    })
}

exports.create = async (req, res) => {
    const { mountain, totalPerson, totalPrice, leavingDate, returningDate, ccnumber, month, year, cvc } = req.body

    const user = req.user._id

    if (!mountain || !totalPerson || !totalPrice || !leavingDate || !returningDate || !ccnumber || !month || !year || !cvc) {
        return res.status(400).json({
            status: 400,
            message: err.message || 'bad request'
        })
    }

    await stripe.tokens.create({
        card: {
          number: ccnumber,
          exp_month: month,
          exp_year: year,
          cvc: cvc
        }
      })
      .then(token => {
        return stripe.charges.create({
          amount: totalPrice * 100,
          currency: 'idr',
          source: token.id
        });
      })
      .then(async result => {
        await bookingModel.create({mountain, user, totalPerson, totalPrice, leavingDate, returningDate})
        .then(data => {
            if (!data) {
                return res.status(404).json({
                    status: 404,
                    message: `Transaction not found with id = ${req.params.id}`
                }) 
            }

            bookingModel.findById(data._id).populate({path:'user', select: ['_id', 'name']}).populate('mountain')
                .then(async createdData => {
                    await mountainModel.findByIdAndUpdate({_id: mountain}, { $inc: { quota: -totalPerson} })
                        .then(() => {
                            deleteKey('booking-get')
                        })
                        .catch(err => {
                            console.log(`something went wrong while updating: ${err.message}`)
                        })
                    
                    sendNotification(result.receipt_url, req.query.playerId)
                    res.json({
                        status: 200,
                        message: 'transaction success',
                        data: createdData
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        status: 500,
                        message: `something went wrong: ${err.message}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                status: 500,
                message: `something went wrong: ${err.message}`,
                data: []
            }) 
        })
      })
}

