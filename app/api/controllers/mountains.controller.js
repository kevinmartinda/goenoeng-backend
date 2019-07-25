'use strict'

const mountainsModel = require('../models/mountains.model')
const { _doMultipleUpload } = require('../middleware/upload.middleware')
const { client, deleteKey } = require('../middleware/redis.middleware')

exports.findAll = async (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const limit = req.query.limit ? parseInt(req.query.limit) : 10
  const page = req.query.page ? parseInt(req.query.page) : 1
  const offset = (page - 1) * limit
  let totalRows

  const key = `mountain-get:all:${search}:${limit}:${page}:${offset}`

  return client.get(key, async (err, reply) => {
    console.log(reply)
    if (reply) {
      return res.json({ source: 'cache', status: 200, data: JSON.parse(reply) })
    } else {
      await mountainsModel.countDocuments({
        name: { $regex: search, $options: 'i' }
      })
        .then(data => {
          totalRows = data
          return totalRows
        })
        .catch(err => {
          res.status(500).json({
            status: 500,
            message: err.message || 'same error'
          })
        })
    
      const totalPage = Math.ceil(parseInt(totalRows) / limit)
    
      await mountainsModel.find({
        name: { $regex: search, $options: 'i' }
      })
        .limit(limit)
        .skip(offset)
        .then(data => {

          const cache = client.setex(key, 3600, JSON.stringify(data))
          console.log(cache)
          
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
  })
}

exports.findById = async (req, res) => {
  const key = `mountain-get:by:${req.params.id}`

  return client.get(key, async (err, reply) => {
    if (reply) {
      return res.json({ source: 'cache', status: 200, data: JSON.parse(reply) })
    } else {    
      await mountainsModel.findById(req.params.id)
      .then(data => {
        client.setex(key, 3600, JSON.stringify(data))
        res.json({
          status: 200,
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
  })

}

exports.create = async (req, res) => {
  const { name, summit, quota, level, address, easiestRoute, latitude, longitude, price } = req.body

  let images

  if (req.files.length > 0) {
    images = await _doMultipleUpload(req)
  } else {
    images = ['https://res.cloudinary.com/sobat-balkon/image/upload/v1562715024/sample.jpg']
  }

  if (!name || !summit || !quota || !level || !address || !easiestRoute || !latitude || !longitude || !price) {
    return res.status(400).json({
      status: 400,
      message: 'name, summit, quota, level, address, easiestRoute, coordinate, price cannot be null'
    })
  }

  await mountainsModel.create({ name, summit, quota, level, address, images, price, easiestRoute, 
    location: {
      type: 'Point',
      coordinates: [longitude, latitude] 
    }})
    .then(data => {
      mountainsModel.findById(data._id)
        .then(createdData => {
          deleteKey('mountain-get')
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
  const updated = { ...req.body }

  let images

  if (req.files.length > 0) {
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
          deleteKey('mountain-get')
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
      deleteKey('mountain-get')
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
