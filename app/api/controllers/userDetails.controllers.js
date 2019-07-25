'use strict'

const userDetailModel = require('../models/userDetails.models')
const { userModel } = require('../models/users.models')
const { _doMultipleUpload } = require('../middleware/upload.middleware')

exports.get = async (req, res) => {
	let user = req.user
	if (user.level == 'user') {
		// get user
		await userDetailModel.findOne({user}).populate({           
				path: 'user', select: ['_id', 'name', 'email', 'address', 'phone']
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

exports.getOne = async (req, res) => {
	
		// get user
		await userDetailModel.findOne({_id: req.params.id}).populate({           
				path: 'user', select: ['_id', 'name', 'email', 'address', 'phone']
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

exports.updateProfile = async (req, res) => {
	let user = req.user
	if (user.level == 'user') {
		let images

		let editUser = {}
	  if(req.body.name) {
	  	editUser.name = req.body.name
	  }
	  if(req.body.phone) {
	  	editUser.phone = req.body.phone	
	  }
	  if(req.body.address) {
	  	editUser.address = req.body.address
	  }
	  
	  if(editUser) {
	  	await userModel.findOneAndUpdate({ _id: user._id }, editUser)
	  }

		// res.json(req.body);
		if(req.files && req.files.length > 0) {
	    images = await _doMultipleUpload(req)
	    req.body.image = images[0];
	  }

		await userDetailModel.findOneAndUpdate({user}, req.body)
		.then(data => {
			userDetailModel.findOne({_id: data._id})
			.populate({
				path: 'user', select: ['_id', 'name', 'email', 'address', 'phone']
			})
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
	else {
		return res.status(400).json({
      status: 'failed',
      message: `Access danied`
    })
	}
}