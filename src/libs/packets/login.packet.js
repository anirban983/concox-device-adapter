"use-strict";

const { loginPacketFormat, loginPacketResponseFormat } = require('../protocol-formats')
const { insertSpaceEveryNPos, decimalToHex, hexToDecimal, hexToBinary, crc16, getHexBytes } = require('../helper')

// function to decode to login packet
const decodeLoginPacket = (msg) => {
    let i = 0;
    let decoded = {};

    // separating values for each bits from the whole packet
    Object.keys(loginPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(loginPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    // decoding each bit 
    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const infoContent = decoded['Information Content']
    const infoContentVal = infoContent['value']

    infoContent['Terminal ID'] = {
        'value':  infoContentVal.substring(0, 
            loginPacketFormat['Information Content']['Terminal ID'].length*2),
        'description': 'IMEI Number is: ' + infoContentVal.substring(1, 
            loginPacketFormat['Information Content']['Terminal ID'].length*2)
    }

    infoContent['Type Identification Code'] = {
        'value': infoContentVal.substring(16, 
            16 + loginPacketFormat['Information Content']['Type Identification Code'].length*2),
        'description': 'Terminal Type: ' + infoContentVal.substring(16, 
            16 + loginPacketFormat['Information Content']['Type Identification Code'].length*2)
    }

    infoContent['Time Zone Language'] = {
        'value':  infoContentVal.substring(20, 
            20 + loginPacketFormat['Information Content']['Time Zone Language'].length*2),
        'description': 'Time Zone: ' + decodeTimeLang(infoContentVal.substring(20, 
            20 + loginPacketFormat['Information Content']['Time Zone Language'].length*2))
    }

    decoded['Information Serial Number']['description'] = getHexBytes(decoded['Information Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded;
}

// function to decode time and language
const decodeTimeLang = (hex) => {
    const decimal = hexToDecimal(hex.substring(0,3)) // getting bits for first 3 hex characters for gmt time difference
    const byte2 = hexToBinary(hex.substring(2,4)) // getting byte 2
    let timeLang = 'GMT'
    let time = ''
    if (byte2.substring(7,8) === '1') {
        time = 'Western Time'
        timeLang += '+'
    } else {
        time = 'Eastern Time'
        timeLang += '-'
    }
    const gmt = String(decimal/100).replace('.', ':')
    timeLang += gmt
    return timeLang + '(' + time + ')'
}

// function to encode login packet response from decoded request packet
const encodeLoginPacketResp = (decoded) => {
    let encoded = ''

    // getting same start bit from decoded
    const startBit = decoded['Start Bit']['value']
    encoded += startBit
    
    // calculating packet length
    const packetLen = loginPacketResponseFormat['Protocol Number'].length + loginPacketResponseFormat['Information Serial Number'].length
        + loginPacketResponseFormat['Error Check'].length
    // converting from decimal to hexadecimal
    let hexPacketLen = decimalToHex(packetLen).toString()
    if (hexPacketLen.length === 1) {
        hexPacketLen = '0'+hexPacketLen
    }
    encoded += hexPacketLen

    // same value as in request packet for protocol number
    const protocolNum = decoded['Protocol Number']['value']
    encoded += protocolNum

    const informationSrNum = '0005'
    encoded += informationSrNum

    // calculating error code using crc16 
    let errorCode = crc16(encoded.substr(4))
    if (errorCode.length < 4 ) {
        errorCode = '0'.repeat(4-errorCode.length) + errorCode
    }
    encoded += errorCode

    // fixed for stop bit & same as request packet
    const stopBit = decoded['Stop Bit']['value'];
    encoded += stopBit

    // inserting spaces every 2nd positing for visual representation
    return insertSpaceEveryNPos(encoded, 2)
}

module.exports = { decodeLoginPacket, encodeLoginPacketResp }