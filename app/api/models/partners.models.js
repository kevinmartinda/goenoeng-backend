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
    image: {
        type: String
    },
    description: {
        type: String
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    mountain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mountains'
    },
    role: {
      type: String,
      enum: ['partner', 'jasa'],
      default: 'partner'
    }
}, {
    timestamps: true
})

PartnersSchema.index({location: '2dsphere'});
PartnersSchema.pre('save', function(next) {
  if (this.isNew && Array.isArray(this.location) && 0 === this.location.length) {
    this.location = undefined;
  }
  next()
})

const Mitra = mongoose.model('Partner', PartnersSchema)
module.exports = Mitra