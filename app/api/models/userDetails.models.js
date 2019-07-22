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
    tanggal_lahir: {
        type: 'String',
    },
    image_profil: {
        type: 'String',
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('UserDetails', UserDetailModel)