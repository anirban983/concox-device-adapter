"use-strict";

const express = require('express')
const router = new express.Router()
const logger = require('../libs/logger')

const exceptionHandler = require('../libs/exception-handler')

const { decodeLoginPacket, encodeLoginPacketResp } = require('../libs/packets/login.packet')
const { decodeHeartbeatPacket, encodeHeartbeatPacketResp } = require('../libs/packets/heartbeat.packet')
const { decodeGpsLocationPacket } = require('../libs/packets/gps-location.packet')

// all the endpoint callbacks functions are first-class functions passed into a global exception handler to catch exceptions and log

/**
 *  @swagger
 *  /api/login:
 *  post:
 *      summary: Receives & decodes the login packet using the attached protocol document
 *      description: Responds to the login packet using the attached protocol document.
 *      produces:
 *          - application/json
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          loginPacket:
 *                              type: string
 *                              description: Login packet to decode
 *                              example: "78 78 11 01 03 51 60 80 80 77 92 88 22 03 32 01 01 AA 53 36 0D 0A"
 *      responses:
 *          200:
 *              description: Login Packet response.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: string
 *          500: 
 *              description: Internal Server Error.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  description: Error message.
 *                                  example: Internal Server Error.
 *          503:
 *              description: Timed Out response.
 *                            
 */
router.post('/login', exceptionHandler( async (req, res) => {
    logger.debug('Recieved Login Packet: ' + req.body.loginPacket)
    
    // removing all possible spaces from login packet and decoding the message
    let msg = req.body.loginPacket.replace(/\s/g, "")
    const decoded = decodeLoginPacket(msg)
    
    logger.debug('Decoded Login Packet\n'+JSON.stringify(decoded, null, 4))

    // encoding/ creating login response and sending it back with a status of 200
    const encodedResponse = encodeLoginPacketResp(decoded)
    res.json(encodedResponse)
}))


/**
 *  @swagger
 *  /api/heartbeat:
 *  post:
 *      summary: Receives & decodes the heartbeat packet using the attached protocol document
 *      description: Responds to the heartbeat packet using the attached protocol document.
 *      produces:
 *          - application/json
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          heartbeatPacket:
 *                              type: string
 *                              description: Heartbeat packet to decode
 *                              example: "78 78 0B 23 C0 01 22 04 00 01 00 08 18 72 0D 0A"
 *      responses:
 *          200:
 *              description: Heartbeat Packet response.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: string
 *          500: 
 *              description: Internal Server Error.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  description: Error message.
 *                                  example: Internal Server Error.
 *          503:
 *              description: Timed Out response.
 *                            
 */
router.post('/heartbeat', exceptionHandler( async (req, res) => {
    logger.debug('Recieved Heartbeat Packet: ' + req.body.heartbeatPacket)

    // removing all possible spaces from heartbeat packet and decoding the message
    let msg = req.body.heartbeatPacket.replace(/\s/g, "")
    const decoded = decodeHeartbeatPacket(msg)
    logger.debug('Decoded Heartbeat Packet\n'+JSON.stringify(decoded, null, 4))

    // encoding/ creating heartbeat response and sending it back with a status of 200
    const encodedResponse = encodeHeartbeatPacketResp(decoded)
    res.json(encodedResponse)
}))


/**
 *  @swagger
 *  /api/gps-location:
 *  post:
 *      summary: Receives & decodes the gps location packet using the attached protocol document
 *      description: Responds to the gps location packet using the attached protocol document.
 *      produces:
 *          - application/json
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          gpsLocationPacket:
 *                              type: string
 *                              description: GPS location packet to decode
 *                              example: "78 78 22 22 0F 0C 1D 02 33 05 C9 02 7A C8 18 0C 46 58 60 00 14 00 01 CC 00 28 7D 00 1F 71 00"
 *      responses:
 *          200:
 *              description: GPS Location packet request message saved in file storage.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "GPS Location Packet saved in file storage!"
 *          500: 
 *              description: Internal Server Error.
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  description: Error message.
 *                                  example: Internal Server Error.
 *          503:
 *              description: Timed Out response.
 *                            
 */
router.post('/gps-location', exceptionHandler( async (req, res) => {
    logger.debug('Recieved GPS Location Packet: ' + req.body.gpsLocationPacket)

    // saving/ logging the recieved gps location packet in logs/gps-location.log 
    logger.info('Recieved GPS Location Packet: ' + req.body.gpsLocationPacket)

    // removing all possible spaces from gps location packet and decoding the message
    let msg = req.body.gpsLocationPacket.replace(/\s/g, "")
    decoded = decodeGpsLocationPacket(msg)
    logger.debug('Decoded GPS Location Packet\n'+JSON.stringify(decoded, null, 4))

    // saving/ logging the decoded gps location in logs/gps-location.log 
    logger.info('Decoded GPS Location Packet\n'+JSON.stringify(decoded, null, 4))

    res.json('GPS Location Packet saved in file storage!');
}))

module.exports = router