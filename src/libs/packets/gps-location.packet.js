const { gpsLocationPacketFormat } = require('../protocol-formats')
const { hexToDecimal, binaryToDecimal, getHexBytes, hexToBinary } = require('../helper')

const decodeGpsLocationPacket = (msg) => {

    let i = 0;
    let decoded = {};
    Object.keys(gpsLocationPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(gpsLocationPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const informationContent = decoded['Information Content']
    informationContent['Date Time'] = {
        'value':  informationContent['value'].substring(0, 
            gpsLocationPacketFormat['Information Content']['Date Time'].length*2),
        'description': 'DateTime is: ' + decodeDateTime(informationContent['value'].substring(0, 
            gpsLocationPacketFormat['Information Content']['Date Time'].length*2)) + ' (YY-MM-DD HH:mm:ss)'
    }

    informationContent['Quantity of GPS information satellites'] = {
        'value':  informationContent['value'].substring(12, 
            12 + gpsLocationPacketFormat['Information Content']['Quantity of GPS information satellites'].length*2),
        'description': decodeGpsInfo(informationContent['value'].substring(12, 
            12 + gpsLocationPacketFormat['Information Content']['Quantity of GPS information satellites'].length*2))
    }

    informationContent['Latitude'] = {
        'value':  informationContent['value'].substring(14, 
            14 + gpsLocationPacketFormat['Information Content']['Latitude'].length*2),
        'description': decodeLatLong(informationContent['value'].substring(14, 
            14 + gpsLocationPacketFormat['Information Content']['Latitude'].length*2))
    }

    informationContent['Longitude'] = {
        'value':  informationContent['value'].substring(22, 
            22 + gpsLocationPacketFormat['Information Content']['Longitude'].length*2),
        'description': decodeLatLong(informationContent['value'].substring(22, 
            22 + gpsLocationPacketFormat['Information Content']['Longitude'].length*2))
    }

    informationContent['Speed'] = {
        'value':  informationContent['value'].substring(30, 
            30 + gpsLocationPacketFormat['Information Content']['Speed'].length*2),
        'description': hexToDecimal(informationContent['value'].substring(30, 
            30 + gpsLocationPacketFormat['Information Content']['Speed'].length*2))
    }

    informationContent['Course, Status'] = {
        'value':  informationContent['value'].substring(32, 
            32 + gpsLocationPacketFormat['Information Content']['Course, Status'].length*2),
        'description': decodeCourseStatus(informationContent['value'].substring(32, 
            32 + gpsLocationPacketFormat['Information Content']['Course, Status'].length*2))
    }

    informationContent['MCC'] = {
        'value':  informationContent['value'].substring(36, 
            36 + gpsLocationPacketFormat['Information Content']['MCC'].length*2),
        'description': hexToDecimal(informationContent['value'].substring(36, 
            36 + gpsLocationPacketFormat['Information Content']['MCC'].length*2))
    }

    informationContent['MNC'] = {
        'value':  informationContent['value'].substring(40, 
            40 + gpsLocationPacketFormat['Information Content']['MNC'].length*2),
        'description': hexToDecimal(informationContent['value'].substring(40, 
            40 + gpsLocationPacketFormat['Information Content']['MNC'].length*2))
    }

    informationContent['LAC'] = {
        'value':  informationContent['value'].substring(42, 
            42 + gpsLocationPacketFormat['Information Content']['LAC'].length*2),
        'description': hexToDecimal(informationContent['value'].substring(42, 
            42 + gpsLocationPacketFormat['Information Content']['LAC'].length*2))
    }

    informationContent['Cell ID'] = {
        'value':  informationContent['value'].substring(46, 
            46 + gpsLocationPacketFormat['Information Content']['Cell ID'].length*2),
        'description': hexToDecimal(informationContent['value'].substring(46, 
            46 + gpsLocationPacketFormat['Information Content']['Cell ID'].length*2))
    }

    informationContent['ACC'] = {
        'value':  informationContent['value'].substring(52, 
            52 + gpsLocationPacketFormat['Information Content']['ACC'].length*2),
        'description': decodeAcc(informationContent['value'].substring(52, 
            52 + gpsLocationPacketFormat['Information Content']['ACC'].length*2))
    }

    informationContent['Data Upload Mode'] = {
        'value':  informationContent['value'].substring(54, 
            54 + gpsLocationPacketFormat['Information Content']['Data Upload Mode'].length*2),
        'description': decodeDataUploadMode(informationContent['value'].substring(54, 
            54 + gpsLocationPacketFormat['Information Content']['Data Upload Mode'].length*2))
    }

    informationContent['GPS Real-time Re-upload'] = {
        'value':  informationContent['value'].substring(56, 
            56 + gpsLocationPacketFormat['Information Content']['GPS Real-time Re-upload'].length*2),
        'description': decodeGpsRTU(informationContent['value'].substring(56, 
            56 + gpsLocationPacketFormat['Information Content']['GPS Real-time Re-upload'].length*2))
    }

    decoded['Serial Number']['description'] = getHexBytes(decoded['Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded

}   

const decodeDateTime = (hex) => {
    let arr = []
    let i = 0
    while (i<hex.length) {
        let ent = hexToDecimal(hex.substring(i, i+2))
        if (ent.length === 1) {
            ent = '0' + ent
        }
        arr.push(ent)
        i += 2
    }
    const year = arr[0]
    const month = arr[1]
    const day = arr[2]
    const hour = arr[3]
    const min = arr[4]
    const sec = arr[5]

    const date = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec 
    return date
}

const decodeGpsInfo = (hex) => {
    const gpsInfoLen = hexToDecimal(hex[0])
    const satPos = hexToDecimal(hex[1])
    return 'GPS Information Length: ' + gpsInfoLen + ', Satellite Position: ' + satPos
}

const decodeCourseStatus = (hex) => {
    const arr = []
    const byteArr1 = hexToBinary(hex.substring(0,2)).split('').reverse()
    
    if (byteArr1[5] === '0') {
        arr.push('Real-time GPS')
    } else {
        arr.push('Differential positioning GPS')
    }

    if (byteArr1[4] === '0') {
        arr.push('GPS has not been positioned')
    } else {
        arr.push('GPS has been positioned')
    }

    if (byteArr1[3] === '0') {
        arr.push('East Longitude')
    } else {
        arr.push('West Longitude')
    }

    if (byteArr1[2] === '0') {
        arr.push('South Longitude')
    } else {
        arr.push('North Longitude')
    }

    let byte2 = hexToBinary(hex.substring(2,4))
    byte2 = byteArr1[1] + byteArr1[0] + byte2
    const course = binaryToDecimal(byte2)
    const status = arr.join(', ')
    return status + ' and the Course is ' + course +'°'
}

const decodeLatLong = (hex) => {
    const decimal = hexToDecimal(hex)
    return decimal/1800000+'°'
}

const decodeAcc = (hex) => {
    if (hex === '00') return 'ACC Status Low'
    else if ((hex === '01')) return 'ACC Status High'
    else return 'ACC Status Unknown'
}

const decodeDataUploadMode = (hex) => {
    if (hex === '00') return 'Upload by time interval'
    else if (hex === '01') return 'Upload by distance interval'
    else if (hex === '02') return 'Inflection point upload'
    else if (hex === '03') return 'ACC status upload'
    else if (hex === '04') return 'Re-upload the last GPS point when back to static'
    else if (hex === '05') return 'Upload the last effective point when network recovers'
    else if (hex === '06') return 'Update ephemeris and upload GPS data compulsorily'
    else if (hex === '07') return 'Upload location when side key triggered'
    else if (hex === '08') return 'Upload location after power on'
    else if (hex === '09') return 'Unused'
    else if (hex === '0A') return 'Upload the last longitude and latitude when device is static; time updated'
    else if (hex === '0D') return 'Upload the last longitude and latitude when device is static'
    else if (hex === '0E') return 'Gpsdup upload (Upload regularly in a static state.)'
}

const decodeGpsRTU = (hex) => {
    if (hex === '00') return 'Real time upload'
    else if ((hex === '01')) return 'Re-upload'
    else return 'Unknown'
}

module.exports = { decodeGpsLocationPacket }