'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PartnersSchema = new Schema({
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
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
}, {
    timestamps: true
})

const Mitra = mongoose.model('Partner', PartnersSchema)
module.exports = Mitra