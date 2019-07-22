'use strict'

const mountainsModel = require('../models/mountains.model')
const { _doMultipleUpload } = require('../middleware/upload.middleware')

exports.findAll = async (req, res) => {
  let search = req.query.search ? req.query.search : '' 
  let limit = req.query.limit ? parseInt(req.query.limit) : 10
  let page = req.query.page ? parseInt(req.query.page) : 1
  let offset = (page - 1) * limit
  let totalRows

  await mountainsModel.countDocuments({
    'name': { $regex: search, $options: 'i' }
  })
  .then(data => totalRows = data)
  .catch(err => {
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  })

  let totalPage = Math.ceil(parseInt(totalRows) / limit)

  await mountainsModel.find({
    'name': { $regex: search, $options: 'i' }
  })
  .limit(limit)
  .skip(offset)
  .then(data => {
    res.json({
      status: 200,
      totalRows,
      limit,
      page,
      totalPage,
      data
    })
  })
  .catch(err => (
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  ))
}

exports.findById = async (req, res) => {
  await mountainsModel.findById(req.params.id)
  .then(data => (
    res.json({
      status: 200,
      data
    })
  ))
  .catch(err => (     
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  ))
}

exports.create = async (req, res) => {
  const { name, summit, quota, mountainType, address, easiestRoute, latitude, longitude } = req.body

  let images

  if(req.files.length > 0) {
    images = await _doMultipleUpload(req)
  } else {
    images = ['https://res.cloudinary.com/sobat-balkon/image/upload/v1562715024/sample.jpg']
  }

  if (!name || !summit || !quota || !mountainType || !address || !easiestRoute || !latitude || !longitude) {
    return res.status(400).json({
      status: 400,
      message: 'name, summit, quota, mountainType, address, easiestRoute, coordinate cannot be null'
    })
  }

  await mountainsModel.create({ name, summit, quota, mountainType, address, images, easiestRoute, latitude, longitude })
  .then(data => {
    mountainsModel.findById(data._id)
    .then(createdData => {
      res.json({
        status: 200,
        data: createdData
      })
    })
  })
  .catch(err => {
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  })
}

exports.update = async (req, res) => {
  const updated = {...req.body}
  
  let images

  if(req.files.length > 0) {
    images = await _doMultipleUpload(req)
    updated.images = images
  }

  await mountainsModel.findByIdAndUpdate(req.params.id, updated, { new: true })
  .then(data => {
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: `Mountain not found with id = ${req.params.id}`
      }) 
    }

    mountainsModel.findById(data._id)
    .then(updatedData => {
      res.json({
        status: 200,
        data: updatedData
      })
    })
  })
  .catch(err => {
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  })
}

exports.delete = async (req, res) => {
  await mountainsModel.findByIdAndDelete(req.params.id)
  .then(data => {
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: `Mountain not found with id = ${req.params.id}`
      }) 
    }

    res.json({
      status: 200,
      _id: req.params.id
    })
  })
  .catch(err => {
    res.status(500).json({
      status: 500,
      message: err.message || 'same error'
    })
  })
}