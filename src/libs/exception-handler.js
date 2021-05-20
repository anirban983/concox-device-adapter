const logger = require('./logger')

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