'use strict'

const bookingModel = require('../models/booking.model')
const partnerModel = require('../models/partners.models')
const mountainModel = require('../models/mountains.model')

const { client, deleteKey } = require('../middleware/redis.middleware')

exports.findAllUserBooking = async (req, res) => {
    await bookingModel.find({
        user: req.user._id
    }).populate({path:'user', select: ['_id', 'name']}).populate('mountain')
            .then(data => (
                res.json({
                    status: 200,
                    data
                })
            ))
            .catch(err => {
                return res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
}

exports.create = async (req, res) => {
    const { mountain, totalPerson, totalPrice, leavingDate, returningDate } = req.body

    const user = req.user._id

    if (!mountain || !totalPerson || !totalPrice || !leavingDate || !returningDate) {
        return res.status(400).json({
            status: 400,
            message: err.message || 'bad request'
        })
    }

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
                        deleteKey('mountain-get:')
                    })
                    .catch(err => {
                        console.log(`something went wrong while updating: ${err.message}`)
                    })

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
}

