const mongoose = require('mongoose')

const MountainModel = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  summit: {
    type: Number,
    required: true
  },
  quota: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ['pemula', 'menengah', 'expert']
  },
  address: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  price: {
    type: Number
  },
  easiestRoute: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
    timestamps: true
})

MountainModel.index({location: '2dsphere'});
MountainModel.pre('save', function(next) {
  if (this.isNew && Array.isArray(this.location) && 0 === this.location.length) {
    this.location = undefined;
  }
  next()
})

module.exports = mongoose.model('Mountains', MountainModel)
