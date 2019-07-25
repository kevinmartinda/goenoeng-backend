'use strict'

const mongoose = require('mongoose')

const UserDetailModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    gender: {
        type: 'String',
    },
    birth: {
        type: 'String',
    },
    image: {
        type: 'String',
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('UserDetails', UserDetailModel)