'use strict'

const rentalTransactionModel = require('../models/rentalTransaction.model')
const sendNotification = require('../middleware/sendNotification.lib')
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY)

exports.findAllUserTransaction = async (req, res) => {
    await rentalTransactionModel.find({
        user: req.user._id
    }).populate({path:'user', select: ['_id', 'name']}).populate('product').populate({path: 'seller', select: ['_id', 'name'], populate: {path: 'partner', select: ['_id', 'name']}})
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

exports.findById = async (req, res) => {
    await rentalTransactionModel.findById(req.params.id)
            .then(data => (
                res.json({
                    status: 200,
                    data
                })
            ))
            .catch(err => (     
                res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            ))
}

exports.create = async (req, res) => {
    const { product, totalPrice, totalItem, rentDate, returnDate, ccnumber, year, month, cvc } = req.body
    const user = req.user._id
    if (!user || !product || !totalPrice || !totalItem || !rentDate || !returnDate || !ccnumber || !year || !month || !cvc) {
        return res.status(400).json({
            status: 400,
            message: 'product, totalPrice, totalItem, rentDate, returnDate is required'
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
            await rentalTransactionModel.create({ user, product, totalPrice, totalItem, rentDate, returnDate })
            .then(data => {
                rentalTransactionModel.findById(data._id).populate({path:'user', select: ['_id', 'name']}).populate('product').populate({path: 'seller', select: ['_id', 'name'], populate: {path: 'partner', select: ['_id', 'name']}})
                    .then(createdData => {
                        sendNotification(result.receipt_url, req.query.playerId)
                        res.json({
                            status: 200,
                            payment_token: result.id,
                            data: createdData
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            status: 500,
                            message: err.message || 'same error'
                        })
                    })
            })
            .catch(err => {
                return res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
          })
          .catch(err => {
            res.status(500).json(err);
          });
}

exports.update = async (req, res) => {

    await rentalTransactionModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        status: 404,
                        message: `Transaction not found with id = ${req.params.id}`
                    }) 
                }

                rentalTransactionModel.findById(data._id)
                    .then(updatedData => (
                        res.json({
                            status: 200,
                            data: updatedData
                        })
                    )).catch(err => {
                        return res.status(500).json({
                            status: 500,
                            message: `someting went wrong: ${err.message}`,
                            data: []
                        }) 
                    })
            })
            .catch(err => {
                if(err.kind === 'ObjectId') {
                    return res.status(404).json({
                        status: 404,
                        message: `Transaction not found with id = ${req.params.id}`,
                        data: []
                    }) 
                }

                res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
}
