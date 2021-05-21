"use-strict";

const logger = require('./logger')

// exception handler method accepting express http endpoint callback functions for catching exceptions and logginng
const exceptionHandler = (func) => async (req, res) => {
    try {
        logger.debug('Entered into ' + req.method + ' ' + req.path)
        await func(req, res)
    } catch (error) {
        logger.error(error.stack);
        return res.status(500).json({ error: error.message })
    }
}

module.exports = exceptionHandler