'use strict'

const rentalTransactionModel = require('../models/rentalTransaction.model')

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
    const { product, totalPrice, seller, totalItem, rentDate, returnDate } = req.body
    const user = req.user._id
    console.log(req.user)
    if (!user || !product || !totalPrice || !totalItem || !rentDate || !returnDate) {
        return res.status(400).json({
            status: 400,
            message: 'product, totalPrice, totalItem, rentDate, returnDate is required'
        })
    }
    await rentalTransactionModel.create({ user, product, totalPrice, seller, totalItem, rentDate, returnDate })
            .then(data => {
                rentalTransactionModel.findById(data._id).populate({path:'user', select: ['_id', 'name']}).populate('product').populate({path: 'seller', select: ['_id', 'name'], populate: {path: 'partner', select: ['_id', 'name']}})
                    .then(createdData => (
                        res.json({
                            status: 200,
                            data: createdData
                        })
                    ))
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
