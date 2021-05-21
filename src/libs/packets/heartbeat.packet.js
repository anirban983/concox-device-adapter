"use-strict";

const { hearbeatPacketFormat, heartbeatPacketResponseFormat } = require('../protocol-formats')
const { insertSpaceEveryNPos, decimalToHex, hexToDecimal, crc16, getHexBytes, hexToBinary } = require('../helper')

// function to decode to heartbeat packet
const decodeHeartbeatPacket = (msg) => {
    let i = 0;
    let decoded = {};

    // separating values for each bits from the whole packet
    Object.keys(hearbeatPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(hearbeatPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    // decoding each bit one-by-one  
    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const infoContent = decoded['Information Content']
    const infoContentVal = infoContent['value']

    infoContent['Terminal Information Content'] = {
        'value':  infoContentVal.substring(0, 
            hearbeatPacketFormat['Information Content']['Terminal Information Content'].length*2),
        'description': decodeTerminalInformationClient(infoContentVal.substring(0, 
            hearbeatPacketFormat['Information Content']['Terminal Information Content'].length*2))
    }

    infoContent['Voltage Level'] = {
        'value':  infoContentVal.substring(2, 
            2 + hearbeatPacketFormat['Information Content']['Voltage Level'].length*2),
        'description': decodeVoltageLevel(infoContentVal.substring(2, 
            2 + hearbeatPacketFormat['Information Content']['Voltage Level'].length*2)) + 'v'
    }

    infoContent['GSM Signal Strength'] = {
        'value':  infoContentVal.substring(6, 
            6 + hearbeatPacketFormat['Information Content']['GSM Signal Strength'].length*2),
        'description': decodeGsmSignalStrength(infoContentVal.substring(6, 
            6 + hearbeatPacketFormat['Information Content']['GSM Signal Strength'].length*2))
    }

    infoContent['Language/Extended Port Status'] = {
        'value':  infoContentVal.substring(8, 
            8 + hearbeatPacketFormat['Information Content']['Language/Extended Port Status'].length*2),
        'description': decodeLanguage(infoContentVal.substring(8, 
            8 + hearbeatPacketFormat['Information Content']['Language/Extended Port Status'].length*2))
    }

    decoded['Serial Number']['description'] = getHexBytes(decoded['Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded
}

// function to encode hearbeat packet response from decoded request packet
const encodeHeartbeatPacketResp = (decoded) => {
    let encoded = ''

    // getting same start bit from decoded
    const startBit = decoded['Start Bit']['value']
    encoded += startBit

    // calculating packet length
    const packetLen = heartbeatPacketResponseFormat['Protocol Number'].length + heartbeatPacketResponseFormat['Serial Number'].length
        + heartbeatPacketResponseFormat['Error Check'].length
    
    // converting from decimal to hexadecimal
    let hexPacketLen = decimalToHex(packetLen).toString()
    if (hexPacketLen.length === 1) {
        hexPacketLen = '0'+hexPacketLen
    }
    encoded += hexPacketLen

    // same value as in request packet for protocol number
    const protocolNum = decoded['Protocol Number']['value']
    encoded += protocolNum

    const srNum = '0100'
    encoded += srNum

    // calculating error code using crc16
    let errorCode = crc16(encoded.substr(4))
    if (errorCode.length < 4 ) {
        errorCode = '0'.repeat(4-errorCode.length) + errorCode
    }
    encoded += errorCode

    // fixed for stop bit & same as request packet
    const stopBit = decoded['Stop Bit']['value'];
    encoded += stopBit

    return insertSpaceEveryNPos(encoded, 2)
}

// functioin to decode terminal information client
const decodeTerminalInformationClient = (hex) => {
    let informationArr = []
    const binary = hexToBinary(hex)
    const reversed = binary.split("").reverse().join("");

    if (reversed[0] === '0') {
        informationArr.push('Defense Deactivated')
    } else if (reversed[0] === '1') {
        informationArr.push('Defense Activated')
    }

    if (reversed[1] === '0') {
        informationArr.push('ACC Low')
    } else if (reversed[1] === '1') {
        informationArr.push('ACC High')
    }

    if (reversed[2] === '0') {
        informationArr.push('Charge Off')
    } else if (reversed[2] === '1') {
        informationArr.push('Charge On')
    }

    if (reversed[6] === '0') {
        informationArr.push('GPS tracking is off')
    } else if (reversed[6] === '1') {
        informationArr.push('GPS tracking is on')
    }

    if (reversed[7] === '0') {
        informationArr.push('Oil and electricity connected')
    } else if (reversed[7] === '1') {
        informationArr.push('Oil and electricity disconnected')
    }

    return informationArr.join(', ')
}

// function to decode voltage level
const decodeVoltageLevel = (hex) => {
    const decimal = hexToDecimal(hex)
    return parseInt(decimal)/100
}

// function to decode gsm signal sterength
const decodeGsmSignalStrength = (hex) => {
    if (hex === '00') return 'no signal'
    else if (hex === '01') return 'extremely weak signal'
    else if (hex === '02') return 'very weak signal'
    else if (hex === '03') return 'good signal'
    else if (hex === '04') return 'strong signal'
}

// function to decode language
const decodeLanguage = (hex) => {
    if (hex.substring(2,4) === '01') return  'Chinese'
    else if (hex.substring(2,4) === '02') return  'English'
}

module.exports = { decodeHeartbeatPacket, encodeHeartbeatPacketResp }