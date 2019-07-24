'use strict'

const { userModel, validateUser } = require('../models/users.models')
const userDetailModel = require('../models/userDetails.models')
const Partners = require('../models/partners.models')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const saltRounds = 10

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
      phone: req.body.phone,
      level: level,
      password: req.body.password,
    })

    await user.save()
    .then( data => {
      userModel.findById(data._id)
      .then(dataRegister => {
        const token = user.generateAuthToken()

        if (dataRegister.level == 'user') {
          const userDetail = new userDetailModel({
            user: dataRegister._id,
            gender: '',
            tanggal_lahir: '',
            image_profil: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          })

          userDetail.save()
        } else if (dataRegister.level == 'partner') {

          let latitude = (req.body.latitude) ? req.body.latitude : 0
          let longitude = (req.body.longitude) ? req.body.longitude : 0

          const partners = new Partners({
            partner: dataRegister._id,
            coord: {
                latitude: latitude,
                longitude: longitude,
            },
            image_mitra: 'http://pngimages.net/sites/default/files/shop-png-image-54421.png',
            description: '',
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
  let level = req.params.level
  if(level != 'user' && level != 'partner') {
    return res.status(400).json({
      status: 'failed',
      message: `bad request`
    })
  }

  const { error } = validateLogin(req.body)
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: `${error.details[0].message}`
    })
  }

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

exports.changePassword = async (req, res) => {
  let level = req.params.level
  let user = req.user
  if(level != 'user' && level != 'partner') {
    return res.status(400).json({
      status: 'failed',
      message: `bad request`
    })
  }
  else {
    if (user.level != level) {
      return res.status(400).json({
        status: 'failed',
        message: `Access danied`
      })
    }
    else {
      const { error } = validateChangePassword(req.body)
      if (error) {
        return res.status(400).json({
          status: 'failed',
          message: `${error.details[0].message}`
        })
      }

      let user = await userModel.findById(req.user)
      const validPassword = await bcrypt.compare(req.body.old_password, user.password)
      if(!validPassword) {
          return res.status(400).json({
              status: 'failed',
              message: 'Wrong password.'
          });
      }

      req.body.new_password = bcrypt.hashSync(req.body.new_password, saltRounds)
      await userModel.findOneAndUpdate({_id: req.user}, {password: req.body.new_password})
      .then(data=>{
          userModel.findOne({_id: req.user})
          .then(dataUpdate => {
              const token = user.generateAuthToken()
              res.json({
                  status: 'success',
                  data: dataUpdate,
                  token: token
              })
          })
      })
      .catch(err=>{
          return res.status(500).json({
              status: 'failed',
              message: err.message
          })
      })
    
    }
  }
}

function validateLogin(inputLogin) {
  const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(6).max(255).required(),
  }
  return Joi.validate(inputLogin, schema)
}

function validateChangePassword(inputChangePassword) {
  const schema = {
      old_password: Joi.string().min(6).max(255).required(),
      new_password: Joi.string().min(6).max(255).required(),
      new_password_confirmation: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
  }
  return Joi.validate(inputChangePassword, schema)
}