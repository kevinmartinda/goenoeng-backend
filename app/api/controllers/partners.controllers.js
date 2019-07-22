'use strict'

const partnersModel = require('../models/partners.models')

exports.getAll = async (req, res) => {
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