'use strict'

const userDetailModel = require('../models/userDetails.models')
const { _doMultipleUpload } = require('../middleware/upload.middleware')

exports.get = async (req, res) => {
	let user = req.user
	if (user.level == 'user') {
		// get user
		await userDetailModel.findOne({user}).populate({           
				path: 'user', select: ['_id', 'name', 'email', 'address']
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

exports.updateProfile = async (req, res) => {
	let user = req.user
	let images

	// res.json(req.body);
	if(req.files && req.files.length > 0) {
    images = await _doMultipleUpload(req)
    req.body.image_profil = images[0];
  }

	await userDetailModel.findOneAndUpdate({user}, req.body)
	.then(data => {
		userDetailModel.findOne({_id: data._id})
		.populate('user', '-password')
		.then(dataUpdate => {
			res.json({
				status: 'success',
				data: dataUpdate
			})
		})

	})
	.catch(err => {
		return res.status(500).json({
	        status: 500,
            message: err.message || 'some error'
	    })
	})
}