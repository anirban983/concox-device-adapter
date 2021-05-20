const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
var timeout = require('connect-timeout')
const logger = require('./libs/logger')
const apiRouter = require('./routes/api.route')

const app = express()

app.use(timeout('5s'))
app.use(cors())
app.use(morgan('common', { stream: logger.stream }))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/api', apiRouter)

module.exports = app