'use strict'

const partnersModel = require('../models/partners.models')
const { userModel } = require('../models/users.models')
const Joi = require('@hapi/joi')

exports.getFind = async (req, res) => {
	let user = req.user
	if (user.level == 'partner') {
		// get user
		await partnersModel.findOne({partner: user}).populate({           
				path: 'partner', select: ['_id', 'name', 'email', 'address']
    })
		.then(data => {
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

	  let partner = new partnersModel({ _id: req.params.id })

	  let images
	  if(req.files.length > 0) {
        images = await _doMultipleUpload(req)
        console.log('iyes')
    } else {
        images = ["https://res.cloudinary.com/dvmcph6bx/image/upload/v1563823755/sample.jpg"]
    }

    req.body.images_product = images

	  partner.products.push(req.body)

	  partner.save()
	  .then( data => {
	  	res.json({
	  		data
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
  }
  return Joi.validate(inputProduct, schema)
}
