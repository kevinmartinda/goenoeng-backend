const mongoose = require('mongoose')
const Partner = require('./partners.models')

const RentalTransactionModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  totalItem: {
    type: Number
  },
  status: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number
  },
  rentDate: {
    type: Date
  },
  returnDate: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('RentalTransaction', RentalTransactionModel)
