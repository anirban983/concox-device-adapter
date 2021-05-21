"use-strict";

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
var timeout = require('connect-timeout')
const logger = require('./libs/logger')
const apiRouter = require('./routes/api.route')
const config = require('config')

const app = express()

// setting timeoutPeriod as 5s for api
const timeoutPeriod = config.app.apiTimeoutPeriod || '5s'
app.use(timeout(timeoutPeriod))

// adding cors for all origins
app.use(cors())

// HTTP request logger middleware for node.js and streaming with winston logger
app.use(morgan('common', { stream: logger.stream }))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/api', apiRouter)

module.exports = app