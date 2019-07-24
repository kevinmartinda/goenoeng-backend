'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PartnersSchema = new Schema({
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    coord: {
        latitude: {
            type: String
        },
        longitude: {
            type: String
        }
    },
    image_mitra: {
        type: String
    },
    description: {
        type: String
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    mountain: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mountains'   
    }]
}, {
    timestamps: true
})

const Mitra = mongoose.model('Partner', PartnersSchema)
module.exports = Mitra