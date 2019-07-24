const mongoose = require('mongoose')

const BookingModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mountain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mountains'
  },
  totalPerson: {
    type: Number
  },
  totalPrice: {
    type: Number
  },
  leavingDate: {
    type: Date
  },
  returningDate: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Booking', BookingModel)
