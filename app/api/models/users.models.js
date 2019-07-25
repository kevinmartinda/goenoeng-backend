'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const Joi = require('@hapi/joi')
const jwt = require('jsonwebtoken')
const config = require('config')

const Schema = mongoose.Schema

const UserSchema = new Schema({
 	email: {
  		type: String,
  		trim: true,
  		required: true,
  		minlength: 5,
        maxlength: 255
 	},
	name: {
		type: String,
		required: true,
		minlength: 5,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum : ['user','partner', 'jasa'],
    default: 'user'
  },
	password: {
  	type: String,
  	trim: true,
  	required: true,
  	minlength: 6,
    maxlength: 1024
 	}
}, {
    timestamps: true
})

UserSchema.pre('save', function(next) {
	this.password = bcrypt.hashSync(this.password, saltRounds)
	next()
})

UserSchema.methods.generateAuthToken = function() {
	const token = jwt.sign({ _id: this._id, level: this.level  }, config.get('PrivateKey'))
	return token
}

function validateUser(user) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      name: Joi.string().min(3).max(50).required(),
      phone: Joi.string().min(10).max(15).required(),
      address: Joi.string().required(),
      level: Joi.string(),
      password: Joi.string().min(6).max(255).required(),
      password_confirmation: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }),
      latitude: Joi.number(),
      longitude: Joi.number()
    }
    return Joi.validate(user, schema)
}

const Users = mongoose.model('User', UserSchema)

exports.userModel = Users
exports.validateUser = validateUser