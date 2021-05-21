"use-strict";

const app = require('./src/app')
const config = require('config') // getting configuration from config/default.json

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// defining swagger js doc specs
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Concox Device Adapter',
            version: '1.0.0',
            description: 'Device Adaptor for Concox decvices written in Node.js',
        },
    },
    apis: ['src/routes/*.js'],
};
const specs = swaggerJsdoc(options);

// setting up path with swagger js docs for swagger ui 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const host = config.app.host || process.env.HOST || '127.0.0.1'
const port = config.app.port || process.env.PORT || 3000

app.listen(port, host, () => {
    console.log(`Device adapter running at ${host}:${port}`)
})