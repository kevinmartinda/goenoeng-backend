require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

// routes
const usersRoutes = require('./routes/users.routes')

const app = express()

app.use(logger('dev'))
app.use(helmet.xssFilter())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server running in port ${port}`)
})
