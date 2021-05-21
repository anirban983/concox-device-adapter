"use-strict";

const { gpsLocationPacketFormat } = require('../protocol-formats')
const { hexToDecimal, binaryToDecimal, getHexBytes, hexToBinary } = require('../helper')

// function to decode to gsp location packet
const decodeGpsLocationPacket = (msg) => {

    let i = 0;
    let decoded = {};

    // separating values for each bits from the whole packet
    Object.keys(gpsLocationPacketFormat).forEach((key) => {
        decoded[key] = {}
        const increment = i + 2*(gpsLocationPacketFormat[key].length)
        decoded[key]['value'] = msg.substring(i, increment)
        i = increment
    })

    // decoding each bit one-by-one
    decoded['Start Bit']['description'] = getHexBytes(decoded['Start Bit']['value'])

    decoded['Packet Length']['description'] = hexToDecimal(decoded['Packet Length']['value'])
    
    decoded['Protocol Number']['description'] = getHexBytes(decoded['Protocol Number']['value'])

    const infoContentFormat = gpsLocationPacketFormat['Information Content']

    const infoContent = decoded['Information Content']
    const infoContentVal = infoContent['value']
    
    infoContent['Date Time'] = {
        'value':  infoContentVal.substring(0, 
            infoContentFormat['Date Time'].length*2),
        'description': 'DateTime is: ' + decodeDateTime(infoContentVal.substring(0, 
            infoContentFormat['Date Time'].length*2)) + ' (YY-MM-DD HH:mm:ss)'
    }

    infoContent['Quantity of GPS information satellites'] = {
        'value':  infoContentVal.substring(12, 
            12 + infoContentFormat['Quantity of GPS information satellites'].length*2),
        'description': decodeGpsInfo(infoContentVal.substring(12, 
            12 + infoContentFormat['Quantity of GPS information satellites'].length*2))
    }

    infoContent['Latitude'] = {
        'value':  infoContentVal.substring(14, 
            14 + infoContentFormat['Latitude'].length*2),
        'description': decodeLatLong(infoContentVal.substring(14, 
            14 + infoContentFormat['Latitude'].length*2))
    }

    infoContent['Longitude'] = {
        'value':  infoContentVal.substring(22, 
            22 + infoContentFormat['Longitude'].length*2),
        'description': decodeLatLong(infoContentVal.substring(22, 
            22 + infoContentFormat['Longitude'].length*2))
    }

    infoContent['Speed'] = {
        'value':  infoContentVal.substring(30, 
            30 + infoContentFormat['Speed'].length*2),
        'description': hexToDecimal(infoContentVal.substring(30, 
            30 + infoContentFormat['Speed'].length*2))
    }

    infoContent['Course, Status'] = {
        'value':  infoContentVal.substring(32, 
            32 + infoContentFormat['Course, Status'].length*2),
        'description': decodeCourseStatus(infoContentVal.substring(32, 
            32 + infoContentFormat['Course, Status'].length*2))
    }

    infoContent['MCC'] = {
        'value':  infoContentVal.substring(36, 
            36 + infoContentFormat['MCC'].length*2),
        'description': hexToDecimal(infoContentVal.substring(36, 
            36 + infoContentFormat['MCC'].length*2))
    }

    infoContent['MNC'] = {
        'value':  infoContentVal.substring(40, 
            40 + infoContentFormat['MNC'].length*2),
        'description': hexToDecimal(infoContentVal.substring(40, 
            40 + infoContentFormat['MNC'].length*2))
    }

    infoContent['LAC'] = {
        'value':  infoContentVal.substring(42, 
            42 + infoContentFormat['LAC'].length*2),
        'description': hexToDecimal(infoContentVal.substring(42, 
            42 + infoContentFormat['LAC'].length*2))
    }

    infoContent['Cell ID'] = {
        'value':  infoContentVal.substring(46, 
            46 + infoContentFormat['Cell ID'].length*2),
        'description': hexToDecimal(infoContentVal.substring(46, 
            46 + infoContentFormat['Cell ID'].length*2))
    }

    infoContent['ACC'] = {
        'value':  infoContentVal.substring(52, 
            52 + infoContentFormat['ACC'].length*2),
        'description': decodeAcc(infoContentVal.substring(52, 
            52 + infoContentFormat['ACC'].length*2))
    }

    infoContent['Data Upload Mode'] = {
        'value':  infoContentVal.substring(54, 
            54 + infoContentFormat['Data Upload Mode'].length*2),
        'description': decodeDataUploadMode(infoContentVal.substring(54, 
            54 + infoContentFormat['Data Upload Mode'].length*2))
    }

    infoContent['GPS Real-time Re-upload'] = {
        'value':  infoContentVal.substring(56, 
            56 + infoContentFormat['GPS Real-time Re-upload'].length*2),
        'description': decodeGpsRTU(infoContentVal.substring(56, 
            56 + infoContentFormat['GPS Real-time Re-upload'].length*2))
    }

    decoded['Serial Number']['description'] = getHexBytes(decoded['Serial Number']['value'])

    decoded['Error Check']['description'] = 'CRC-ITU From “Packet Length” to “Information Serial Number”: ' 
        + getHexBytes(decoded['Error Check']['value'])
    
    decoded['Stop Bit']['description'] = getHexBytes(decoded['Stop Bit']['value'])

    return decoded

}   

// function to decode date time bits
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
    const year = arr[0] // 0th bit for year
    const month = arr[1] // 1st bit for year
    const day = arr[2] // 2nd bit for year
    const hour = arr[3] // 3rd bit for year
    const min = arr[4] // 4th bit for year
    const sec = arr[5] // 5th bit for year

    const date = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec 
    return date
}

// function to decode gps information bits
const decodeGpsInfo = (hex) => {
    const gpsInfoLen = hexToDecimal(hex[0]) // first character converted to decimal for gps information length
    const satPos = hexToDecimal(hex[1]) // second character converted to decimal for satellite position
    return 'GPS Information Length: ' + gpsInfoLen + ', Satellite Position: ' + satPos
}

// function to decode course and status of the gps
const decodeCourseStatus = (hex) => {
    const arr = []
    const byte1Arr = hexToBinary(hex.substring(0,2)).split('').reverse() // reversing byte to get bits into ascending order
    
    if (byte1Arr[5] === '0') arr.push('Real-time GPS')
    else arr.push('Differential positioning GPS')

    if (byte1Arr[4] === '0') arr.push('GPS has not been positioned')
    else arr.push('GPS has been positioned')

    if (byte1Arr[3] === '0') arr.push('East Longitude')
    else arr.push('West Longitude')

    if (byte1Arr[2] === '0') arr.push('South Longitude')
    else arr.push('North Longitude')

    let byte2 = hexToBinary(hex.substring(2,4))
    byte2 = byte1Arr[1] + byte1Arr[0] + byte2
    const course = binaryToDecimal(byte2) // byte 1 bit 1 and 0 and byte 2 converted into decimal for course
    const status = arr.join(', ')
    return status + ' and the Course is ' + course +'°'
}

// function to decode longitude and latitude
const decodeLatLong = (hex) => {
    const decimal = hexToDecimal(hex)
    return decimal/1800000+'°' // converted from hex and decimal and divided by 1800000
}

// function to decode ACC
const decodeAcc = (hex) => {
    if (hex === '00') return 'ACC Status Low'
    else if ((hex === '01')) return 'ACC Status High'
    else return 'ACC Status Unknown'
}

// function to decode Data Upload Mode
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

// function to decode GPS Real time or re-upload status
const decodeGpsRTU = (hex) => {
    if (hex === '00') return 'Real time upload'
    else if ((hex === '01')) return 'Re-upload'
    else return 'Unknown'
}

module.exports = { decodeGpsLocationPacket }