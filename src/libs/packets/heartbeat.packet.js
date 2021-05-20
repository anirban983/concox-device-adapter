const { hearbeatPacketFormat, heartbeatPacketResponseFormat } = require('../protocol-formats')
const { insertSpaceEveryNPos, decimalToHex, hexToDecimal, crc16, getHexBytes, hexToBinary } = require('../helper')

const decodeHeartbeatPacket = (msg) => {
    let i = 0;
    let decoded = {};
    Object.keys(hearbeatPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(hearbeatPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const informationContent = decoded['Information Content']
    informationContent['Terminal Information Content'] = {
        'value':  informationContent['value'].substring(0, 
            hearbeatPacketFormat['Information Content']['Terminal Information Content'].length*2),
        'description': decodeTerminalInformationClient(informationContent['value'].substring(0, 
            hearbeatPacketFormat['Information Content']['Terminal Information Content'].length*2))
    }

    informationContent['Voltage Level'] = {
        'value':  informationContent['value'].substring(2, 
            2 + hearbeatPacketFormat['Information Content']['Voltage Level'].length*2),
        'description': decodeVoltageLevel(informationContent['value'].substring(2, 
            2 + hearbeatPacketFormat['Information Content']['Voltage Level'].length*2)) + 'v'
    }

    informationContent['GSM Signal Strength'] = {
        'value':  informationContent['value'].substring(6, 
            6 + hearbeatPacketFormat['Information Content']['GSM Signal Strength'].length*2),
        'description': decodeGsmSignalStrength(informationContent['value'].substring(6, 
            6 + hearbeatPacketFormat['Information Content']['GSM Signal Strength'].length*2))
    }

    informationContent['Language/Extended Port Status'] = {
        'value':  informationContent['value'].substring(8, 
            8 + hearbeatPacketFormat['Information Content']['Language/Extended Port Status'].length*2),
        'description': decodeLanguage(informationContent['value'].substring(8, 
            8 + hearbeatPacketFormat['Information Content']['Language/Extended Port Status'].length*2))
    }

    decoded['Serial Number']['description'] = getHexBytes(decoded['Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded
}

const encodeHeartbeatPacketResp = (decoded) => {
    let encoded = ''

    const startBit = decoded['Start Bit']['value']
    encoded += startBit

    const packetLen = heartbeatPacketResponseFormat['Protocol Number'].length + heartbeatPacketResponseFormat['Serial Number'].length
        + heartbeatPacketResponseFormat['Error Check'].length
    let hexPacketLen = decimalToHex(packetLen).toString()
    if (hexPacketLen.length === 1) {
        hexPacketLen = '0'+hexPacketLen
    }
    encoded += hexPacketLen

    const protocolNum = decoded['Protocol Number']['value']
    encoded += protocolNum

    const srNum = '0100'
    encoded += srNum

    let errorCode = crc16(encoded.substr(4))
    if (errorCode.length < 4 ) {
        errorCode = '0'.repeat(4-errorCode.length) + errorCode
    }
    encoded += errorCode

    const stopBit = decoded['Stop Bit']['value'];
    encoded += stopBit

    return insertSpaceEveryNPos(encoded, 2)
}

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

const decodeVoltageLevel = (hex) => {
    const decimal = hexToDecimal(hex)
    return parseInt(decimal)/100
}

const decodeGsmSignalStrength = (hex) => {
    if (hex === '00') return 'no signal'
    else if (hex === '01') return 'extremely weak signal'
    else if (hex === '02') return 'very weak signal'
    else if (hex === '03') return 'good signal'
    else if (hex === '04') return 'strong signal'
}

const decodeLanguage = (hex) => {
    if (hex.substring(2,4) === '01') return  'Chinese'
    else if (hex.substring(2,4) === '02') return  'English'
}

module.exports = { decodeHeartbeatPacket, encodeHeartbeatPacketResp }