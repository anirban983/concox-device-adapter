const winston = require('winston');
const { format } = require('winston');
const LEVEL = Symbol.for('level');

function filterOnly(level) {
    return format(function (info) {
      if (info[LEVEL] === level) {
        return info;
      }
    })();
}

let transportArr = [
    new winston.transports.File({
        filename: './logs/error.log',
        handleExceptions: true,
        colorize: true,
        level: 'error'
    }),
    new winston.transports.File({
        filename: './logs/debug.log',
        colorize: true,
        level: 'debug',
        format: filterOnly('debug')
    }),
    new winston.transports.File({
        filename: './logs/gps-location.log',
        colorize: true,
        level: 'info',
        format: filterOnly('info')
    }),
    new winston.transports.File({
        filename: './logs/combined.log',
        colorize: true
    })
]

const logger = winston.createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: transportArr,
    exitOnError: false
})

module.exports = logger
module.exports.stream = {
    write: function(message, encoding) {
        logger.debug(message);
    } 
}