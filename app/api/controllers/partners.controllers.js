'use strict'

const partnersModel = require('../models/partners.models')
const productssModel = require('../models/products.models')
const { userModel } = require('../models/users.models')
const { _doMultipleUpload } = require('../middleware/upload.middleware')
const Joi = require('@hapi/joi')

exports.getFind = async (req, res) => {
	let user = req.user
	if (user.level == 'partner') {
		// get user
		await partnersModel.findOne({partner: user})
		.populate({           
		  path: 'partner', select: ['_id', 'name', 'email', 'address']
    })
    .populate('products')
    .populate({
    	path: 'mountain'
    })
		.then( data => {
			if(!data){
				return res.status(400).json({
					status: 'failed',
					data: [] 
				})
			}

			res.json({
				status: 'success',
				data
			})
		})
		.catch(err => {
			return res.status(500).json({
		        status: 500,
	            message: err.message || 'some error'
		    })
		})
	}
	else {
		return res.status(400).json({
      status: 'failed',
      message: `Access danied`
    })
	}
}

exports.getOne = async (req, res) => {
  await partnersModel.findOne({ _id: req.params.id })
	.populate({           
	  path: 'partner', select: ['_id', 'name', 'email', 'address']
  })
  .populate('products')
  .populate({
  	path: 'mountain'
  })
	.then( data => {
		if(!data){
			return res.status(400).json({
				status: 'failed',
				data: [] 
			})
		}

		res.json({
			status: 'success',
			data
		})
	})
	.catch(err => {
		return res.status(500).json({
	        status: 500,
            message: err.message || 'some error'
	    })
	})
}

exports.getOneProduct = async (req, res) => {
	await partnersModel.findOne({ _id: req.params.id })
	.populate({           
	  path: 'partner', select: ['_id', 'name', 'email', 'address'],
  })
  .populate({
  	path: 'products', match: { _id: {$eq: req.params.idProduct}}
  })
  .populate({
  	path: 'mountain'
  })
	.then( data => {
		if(!data){
			return res.status(400).json({
				status: 'failed',
				data: [] 
			})
		}

		res.json({
			status: 'success w',
			data
		})
	})
	.catch(err => {
		return res.status(500).json({
	        status: 500,
            message: err.message || 'some error'
	    })
	})
}

exports.getAll = async (req, res) => {
	await partnersModel.find()
	.populate({
		path: 'partner', select: ['_id', 'name', 'email', 'address']
	})
	.populate('products')
	.populate({
    	path: 'mountain'
  }) 
	.then( data => {
		if (!data) {
			return res.status(404).json({
				status: 'not found',
				message: 'empty data',
				data: {}
			})
		}

		res.json({
			status: 'success',
			message: 'get data success',
			data: data
		})
	})
	.catch(err => {
		return res.status(500).json({
	    status: 500,
    	message: err.message || 'some error'
	  })
	})
}

exports.updateProduct = async (req, res) => {
	let user = req.user
	if (user.level == 'partner') {

	  let images
	  if(req.files && req.files.length > 0) {
        images = await _doMultipleUpload(req)
    		req.body.images_product = images
    } 

	  await productssModel.findOneAndUpdate({_id: req.params.id}, req.body )
	  .then(async data => {
		  
		  	await partnersModel.findOne({ partner: req.user._id })
				.populate({
					path: 'partner', select: ['_id', 'name', 'email', 'address']
				})
				.populate('products')
				.populate({
    			path: 'mountain'
   			}) 
				.then( dataUpdate => {
		  		
	  			res.json({
						status: 'success',
						data: dataUpdate
					})
		  		
				})
				.catch( err => {
			  	return res.status(500).json({
		        status: 500,
		        message: err.message || 'some error'
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
	else {
		return res.status(400).json({
      status: 'failed',
      message: `Access danied`
    })
	}
}

exports.add = async (req, res) => {
	let user = req.user
	if (user.level == 'partner') {
		const { error } = validateAddProduct(req.body)
	  if (error) {
	    return res.status(400).json({
	      status: 'failed',
	      message: `${error.details[0].message}`
	    })
	  }

	  let images
	  if(req.files.length > 0) {
        images = await _doMultipleUpload(req)
    } else {
        images = ["https://res.cloudinary.com/dvmcph6bx/image/upload/v1563823755/sample.jpg"]
    }

    req.body.images_product = images

	  const { name_product, price, stok, description, images_product } = req.body

	  await productssModel.create({ name_product, price, stok, description, images_product })
	  .then(async data => {
		  await partnersModel.updateOne({ partner: req.user._id }, {
		  	$push: {
	        products: data._id
	    	}
		  })
		  .then( data => {
		  	partnersModel.findOne({ partner: req.user._id })
				.populate({
					path: 'partner', select: ['_id', 'name', 'email', 'address']
				})
				.populate('products')
				.populate({
    			path: 'mountain'
   			}) 
				.then( dataAdd => {
		  		
	  			res.json({
						status: 'success',
						data: dataAdd
					})
		  		
				})
				.catch( err => {
			  	return res.status(500).json({
		        status: 500,
		        message: err.message || 'some error'
		      })
			  })
		  })
		  .catch( err => {
		  	return res.status(500).json({
	        status: 500,
	        message: err.message || 'some error'
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
	else {
		return res.status(400).json({
      status: 'failed',
      message: `Access danied`
    })
	}
}

function validateAddProduct(inputProduct) {
  const schema = {
      name_product: Joi.string().required(),
      price: Joi.required(),
      description: Joi.string().required(),
      stok: Joi.number(),
  }
  return Joi.validate(inputProduct, schema)
}
