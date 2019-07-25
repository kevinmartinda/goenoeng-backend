'use strict'

const { userModel, validateUser } = require('../models/users.models')
const userDetailModel = require('../models/userDetails.models')
const mountainsModel = require('../models/mountains.model')
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
      .then(async dataRegister => {
        const token = user.generateAuthToken()

        if (dataRegister.level == 'user') {
          const userDetail = new userDetailModel({
            user: dataRegister._id,
            gender: '',
            tanggal_lahir: '',
            image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          })

          await userDetail.save()

          await userDetailModel.findOne({user: dataRegister._id}).populate({           
            path: 'user', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
          })
          .then( dataAs => {
            res.json({
              status: 'success',
              message: "User added successfully",
              data: dataAs,
              token: token,
            })
          })

        } else if (dataRegister.level == 'partner') {

          let latitude = (req.body.latitude) ? req.body.latitude : 0
          let longitude = (req.body.longitude) ? req.body.longitude : 0

          const partners = new Partners({
            partner: dataRegister._id,
            location: {
              type : 'Point',
              coordinates: [longitude, latitude],
            },
            image: 'http://pngimages.net/sites/default/files/shop-png-image-54421.png',
            description: '',
            products: [],
            role: 'partner'
          })

          await partners.save()

          await Partners.findOne({partner: dataRegister._id}).populate({           
            path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
          })
          .populate('products')
          .then( async dataAs => {
            
            let dataPartner = {}
            dataPartner._id = dataAs._id
            dataPartner.user = dataAs.partner
            dataPartner.location = dataAs.location
            dataPartner.products = dataAs.products
            dataPartner.description = dataAs.description
            dataPartner.image = dataAs.image
            dataPartner.createdAt = dataAs.createdAt
            dataPartner.updatedAt = dataAs.updatedAt

            res.json({
              status: 'success',
              message: "User added successfully",
              data: dataPartner,
              token: token,
            })
          })
        }
        else if (dataRegister.level == 'jasa') {

          let latitude = (req.body.latitude) ? req.body.latitude : 0
          let longitude = (req.body.longitude) ? req.body.longitude : 0

          await mountainsModel.create({ name:'name', summit:0, quota:0, mountainType:'tidak', address:'none', images:'http://pngimages.net/sites/default/files/shop-png-image-54421.png', price:0, easiestRoute:'none', 
          location: {
            type: 'Point',
            coordinates: [longitude, latitude] 
          }})
          .then(async dataMountain => {

              const partners = new Partners({
                partner: dataRegister._id,
                location: {
                  type : 'Point',
                  coordinates: [longitude, latitude],
                },
                image: 'http://pngimages.net/sites/default/files/shop-png-image-54421.png',
                description: '',
                mountain: dataMountain._id,
                role: 'jasa'
              })

              await partners.save()

              await Partners.findOne({partner: dataRegister._id}).populate({           
                path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
              })
              .populate('mountain')
              .then( dataAs => {
                

                let dataPartner = {}
                dataPartner._id = dataAs._id
                dataPartner.user = dataAs.partner
                dataPartner.location = dataAs.location
                dataPartner.mountain = dataAs.mountain
                dataPartner.description = dataAs.description
                dataPartner.image = dataAs.image
                dataPartner.createdAt = dataAs.createdAt
                dataPartner.updatedAt = dataAs.updatedAt

                res.json({
                  status: 'success',
                  message: "User added successfully",
                  data: dataPartner,
                  token: token,
                })
              })
          
          })

        }

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


  if(level == 'user') {
    await userDetailModel.findOne({user: user._id}).populate({           
      path: 'user', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
    })
    .then( dataAs => {
      res.json({
        status: 'success',
        message: "User added successfully",
        data: dataAs,
        token: token,
      })
    })
  }
  else if(level == 'partner') {
    await Partners.findOne({partner: user._id}).populate({           
      path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
    })
    .populate('products')
    .then( dataAs => {

      let dataPartner = {}
      dataPartner._id = dataAs._id
      dataPartner.user = dataAs.partner
      dataPartner.location = dataAs.location
      dataPartner.products = dataAs.products
      dataPartner.description = dataAs.description
      dataPartner.image = dataAs.image
      dataPartner.createdAt = dataAs.createdAt
      dataPartner.updatedAt = dataAs.updatedAt

      res.json({
        status: 'success',
        message: "User added successfully",
        data: dataPartner,
        token: token,
      })
    })
  }
  else if(level == 'jasa') {
    await Partners.findOne({partner: user._id}).populate({           
      path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
    })
    .populate('mountain')
    .then( dataAs => {

      let dataPartner = {}
      dataPartner._id = dataAs._id
      dataPartner.user = dataAs.partner
      dataPartner.location = dataAs.location
      dataPartner.mountain = dataAs.mountain
      dataPartner.description = dataAs.description
      dataPartner.image = dataAs.image
      dataPartner.createdAt = dataAs.createdAt
      dataPartner.updatedAt = dataAs.updatedAt

      res.json({
        status: 'success',
        message: "User added successfully",
        data: dataPartner,
        token: token,
      })
    })
  }
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
          .then(async dataUpdate => {
              const token = user.generateAuthToken()
              
              if(dataUpdate.level == 'user') {
                    await userDetailModel.findOne({user: dataUpdate._id}).populate({           
                      path: 'user', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
                    })
                    .then( dataAs => {
                      res.json({
                        status: 'success',
                        message: "Cange password successfully",
                        data: dataAs,
                        token: token,
                      })
                    })
              }
              else if (dataUpdate.level == 'partner') {
                await Partners.findOne({partner: user._id}).populate({           
                  path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
                })
                .populate('products')
                .then( dataAs => {

                  let dataPartner = {}
                  dataPartner._id = dataAs._id
                  dataPartner.user = dataAs.partner
                  dataPartner.location = dataAs.location
                  dataPartner.products = dataAs.products
                  dataPartner.description = dataAs.description
                  dataPartner.image = dataAs.image
                  dataPartner.createdAt = dataAs.createdAt
                  dataPartner.updatedAt = dataAs.updatedAt

                  res.json({
                    status: 'success',
                    message: "Cange password successfully",
                    data: dataPartner,
                    token: token,
                  })
                })
              }
              else if (dataUpdate.level == 'partner') {
                await Partners.findOne({partner: user._id}).populate({           
                  path: 'partner', select: ['_id', 'name', 'email', 'address', 'phone', 'level']
                })
                .populate('mountain')
                .then( dataAs => {

                  let dataPartner = {}
                  dataPartner._id = dataAs._id
                  dataPartner.user = dataAs.partner
                  dataPartner.location = dataAs.location
                  dataPartner.mountain = dataAs.mountain
                  dataPartner.description = dataAs.description
                  dataPartner.image = dataAs.image
                  dataPartner.createdAt = dataAs.createdAt
                  dataPartner.updatedAt = dataAs.updatedAt

                  res.json({
                    status: 'success',
                    message: "Cange password successfully",
                    data: dataPartner,
                    token: token,
                  })
                })
              }
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