const { loginPacketFormat, loginPacketResponseFormat } = require('../protocol-formats')
const { insertSpaceEveryNPos, decimalToHex, hexToDecimal, hexToBinary, crc16, getHexBytes } = require('../helper')

const decodeLoginPacket = (msg) => {
    let i = 0;
    let decoded = {};
    Object.keys(loginPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(loginPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const informationContent = decoded['Information Content']
    informationContent['Terminal ID'] = {
        'value':  informationContent['value'].substring(0, 
            loginPacketFormat['Information Content']['Terminal ID'].length*2),
        'description': 'IMEI Number is: ' + informationContent['value'].substring(1, 
            loginPacketFormat['Information Content']['Terminal ID'].length*2)
    }

    informationContent['Type Identification Code'] = {
        'value': informationContent['value'].substring(16, 
            16 + loginPacketFormat['Information Content']['Type Identification Code'].length*2),
        'description': 'Terminal Type: ' + informationContent['value'].substring(16, 
            16 + loginPacketFormat['Information Content']['Type Identification Code'].length*2)
    }

    informationContent['Time Zone Language'] = {
        'value':  informationContent['value'].substring(20, 
            20 + loginPacketFormat['Information Content']['Time Zone Language'].length*2),
        'description': 'Time Zone: ' + decodeTimeLang(informationContent['value'].substring(20, 
            20 + loginPacketFormat['Information Content']['Time Zone Language'].length*2))
    }

    decoded['Information Serial Number']['description'] = getHexBytes(decoded['Information Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded;
}

const decodeTimeLang = (hex) => {
    const decimal = hexToDecimal(hex.substring(0,3))
    const byte2 = hexToBinary(hex.substring(2,4))
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

const encodeLoginPacketResp = (decoded) => {
    let encoded = ''
    const startBit = decoded['Start Bit']['value']
    encoded += startBit

    const packetLen = loginPacketResponseFormat['Protocol Number'].length + loginPacketResponseFormat['Information Serial Number'].length
        + loginPacketResponseFormat['Error Check'].length
    let hexPacketLen = decimalToHex(packetLen).toString()
    if (hexPacketLen.length === 1) {
        hexPacketLen = '0'+hexPacketLen
    }
    encoded += hexPacketLen

    const protocolNum = decoded['Protocol Number']['value']
    encoded += protocolNum

    const informationSrNum = '0005'
    encoded += informationSrNum

    let errorCode = crc16(encoded.substr(4))
    if (errorCode.length < 4 ) {
        errorCode = '0'.repeat(4-errorCode.length) + errorCode
    }
    encoded += errorCode

    const stopBit = decoded['Stop Bit']['value'];
    encoded += stopBit

    return insertSpaceEveryNPos(encoded, 2)
}

module.exports = { decodeLoginPacket, encodeLoginPacketResp }