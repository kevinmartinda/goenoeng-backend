require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const { cloudinaryConfig } = require('./config/cloudinary.config')

const mountainsRoute = require('./routes/mountains.route')

const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

// routes
const usersRoutes = require('./routes/users.routes')
const userDetailsRoutes = require('./routes/userDetails.routes')
const partnersRoutes = require('./routes/partners.routes')

const { cloudinaryConfig } = require('./config/cloudinary.config')

const app = express()

app.use(logger('dev'))
app.use(helmet.xssFilter())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('*', cloudinaryConfig)

const config = require('config')

const mongoose = require('mongoose')

if (!config.get('PrivateKey')) {
  console.error('FATAL ERROR: PrivateKey is not defined.')
  process.exit(1)
}

mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  dbName: process.env.MONGO_DBNAME
}).then(() => {
  console.log('connection success')
}).catch(err => {
  console.log(`connection error `, err)
  process.exit()
})

// public routes
app.get('/', (req, res) => {
  res.json({ message: 'server running' })
})
app.use('/users', usersRoutes)
app.use('/users', userDetailsRoutes)
app.use('/partners', partnersRoutes)

app.use('/mountains', mountainsRoute)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server running in port ${port}`)
})
