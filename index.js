"use-strict";

const app = require('./src/app')
const config = require('config')

const host = config.app.host
const port = config.app.port

app.listen(port, host, () => {
    console.log(`Device adapter running at ${host}:${port}`)
})