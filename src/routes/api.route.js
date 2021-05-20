const express = require('express')
const router = new express.Router()
const logger = require('../libs/logger')
const exceptionHandler = require('../libs/exception-handler')
const { decodeLoginPacket, encodeLoginPacketResp } = require('../libs/packets/login.packet')
const { decodeHeartbeatPacket, encodeHeartbeatPacketResp } = require('../libs/packets/heartbeat.packet')
const { decodeGpsLocationPacket } = require('../libs/packets/gps-location.packet')

router.post('/login', exceptionHandler( async (req, res) => {
    logger.debug('Recieved Login Packet: ' + req.body.loginPacket)
    let msg = req.body.loginPacket.replace(/\s/g, "")
    const decoded = decodeLoginPacket(msg)
    logger.debug('Decoded Login Packet\n'+JSON.stringify(decoded, null, 4))
    const encodedResponse = encodeLoginPacketResp(decoded)
    res.json(encodedResponse)
}))

router.post('/heartbeat', exceptionHandler( async (req, res) => {
    logger.debug('Recieved Heartbeat Packet: ' + req.body.heartbeatPacket)
    let msg = req.body.heartbeatPacket.replace(/\s/g, "")
    const decoded = decodeHeartbeatPacket(msg)
    logger.debug('Decoded Heartbeat Packet\n'+JSON.stringify(decoded, null, 4))
    const encodedResponse = encodeHeartbeatPacketResp(decoded)
    res.json(encodedResponse)
}))

router.post('/gps-location', exceptionHandler( async (req, res) => {
    logger.debug('Recieved GPS Location Packet: ' + req.body.gpsLocationPacket)
    logger.info('Recieved GPS Location Packet: ' + req.body.gpsLocationPacket)
    let msg = req.body.gpsLocationPacket.replace(/\s/g, "")
    decoded = decodeGpsLocationPacket(msg)
    logger.debug('Decoded GPS Location Packet\n'+JSON.stringify(decoded, null, 4))
    logger.info('Decoded GPS Location Packet\n'+JSON.stringify(decoded, null, 4))
    res.end('GPS Location Packet saved in file storage!');
}))

module.exports = router