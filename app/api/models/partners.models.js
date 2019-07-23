'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Products = new Schema({
    name_product: {
        type: String,
    },
    images_product: {
        type: Array
    },
    price: {
        type: Number,
    },
    stok: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
})

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
    products: [Products]
})

const Mitra = mongoose.model('Partner', PartnersSchema)
module.exports = Mitra