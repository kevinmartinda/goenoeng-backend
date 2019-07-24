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
  mountainType: {
    type: String,
    enum: ['berapi', 'tidak']
  },
  address: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  easiestRoute: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
    timestamps: true
})

module.exports = mongoose.model('Mountains', MountainModel)
