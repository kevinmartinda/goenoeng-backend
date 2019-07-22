'use strict'

const { userModel, validateUser } = require('../models/users.models')
const UserDetailModel = require('../models/userDetails.models')
const Partners = require('../models/partners.models')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')

exports.signup = async (req, res, next) => {
  const { error } = validateUser(req.body)
  if (error) {
    return res.status(400).json({
    	status: 'failed',
    	message: `${error.details[0].message}`
    })
  }

  const level = (req.body.level) ? req.body.level : 'user'
  let user = await userModel.findOne({ email: req.body.email, level: level });
  if (user) {
    return res.status(400).json({
      status: 'failed',
    	message: 'That user already exisits!'
    });
  } else {
    user = new userModel({
      email: req.body.email,
      name: req.body.name,
      address: req.body.address,
      level: level,
      password: req.body.password,
    })

    await user.save()
    .then( data => {
      userModel.findById(data._id)
      .then(dataRegister => {
        const token = user.generateAuthToken()

        if (dataRegister.level == 'user') {
          const userDetail = new UserDetailModel({
            user: dataRegister._id,
            gender: '',
            tanggal_lahir: '',
            image_profil: '',
          })

          userDetail.save()
        } else if (dataRegister.level == 'partner') {
          const partners = new Partners({
            mitra: dataRegister._id,
            coord: {
                latitude: '',
                longitude: '',
            },
            image_mitra: '',
            products: [],
          })

          partners.save()
        }

        res.json({
          status: 'success',
          message: "User added successfully",
          data: dataRegister,
          token: token
        })
      })
    })
    .catch( err => {
      return res.status(500).json({
        status: 500,
        message: err.message || 'some error'
      })
    })
  }
}

exports.login = async (req, res) => {
  const { error } = validateLogin(req.body)
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: `${error.details[0].message}`
    })
  }

  let level = req.params.level
  let user = await userModel.findOne({ email: req.body.email, level: level })
  if (!user) {
    return res.status(400).json({
      status: 'failed',
      message: 'User not found.'
    }); 
  } 
  
  const validPassword = await bcrypt.compare(req.body.password, user.password)

  if(!validPassword) {
    return res.status(400).json({
        status: 'failed',
        message: 'Wrong password.'
      });
  }

  const token = user.generateAuthToken()

  res.json({
    status: 'success',
    data: user,
    token: token
  })
}

function validateLogin(inputLogin) {
  const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(6).max(255).required(),
  }
  return Joi.validate(inputLogin, schema)
}