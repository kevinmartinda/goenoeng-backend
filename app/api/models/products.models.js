'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductsSchema = new Schema({
    name_product: {
        type: String,
        required: true,
    },
    images_product: {
        type: Array,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stok: {
        type: Number,
        default: 0,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

const Products = mongoose.model('Product', ProductsSchema)
module.exports = Products