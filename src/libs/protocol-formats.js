"use-strict";

// contains protocol information like names and length for each packet format according to the document
const protocols = {
    loginPacketFormat: {
        'Start Bit': {
            length: 2
        },
        'Packet Length': {
            length: 1
        },
        'Protocol Number': {
            length: 1
        },
        'Information Content': {
            'Terminal ID': {
                length: 8
            },
            'Type Identification Code': {
                length: 2
            },
            'Time Zone Language': {
                length: 2
            },
            length: 12
        },
        'Information Serial Number': {
            length: 2
        },
        'Error Check': {
            length: 2
        },
        'Stop Bit': {
            length: 2
        }
    }, 
    loginPacketResponseFormat: {
        'Start Bit': {
            length: 2
        },
        'Packet Length': {
            length: 1
        },
        'Protocol Number': {
            length: 1
        },
        'Information Serial Number': {
            length: 2
        },
        'Error Check': {
            length: 2
        },
        'Stop Bit': {
            length: 2
        }
    },
    hearbeatPacketFormat: {
        'Start Bit': {
            length: 2
        },
        'Packet Length': {
            length: 1
        },
        'Protocol Number': {
            length: 1
        },
        'Information Content': {
            'Terminal Information Content': {
                length: 1
            },
            'Voltage Level': {
                length: 2
            },
            'GSM Signal Strength': {
                length: 1
            },
            'Language/Extended Port Status': {
                length: 2
            },
            length: 6
        },
        'Serial Number': {
            length: 2
        },
        'Error Check': {
            length: 2
        },
        'Stop Bit': {
            length: 2
        }
    },
    heartbeatPacketResponseFormat: {
        'Start Bit': {
            length: 2
        },
        'Packet Length': {
            length: 1
        },
        'Protocol Number': {
            length: 1
        },
        'Serial Number': {
            length: 2
        },
        'Error Check': {
            length: 2
        },
        'Stop Bit': {
            length: 2
        }
    },
    gpsLocationPacketFormat: {
        'Start Bit': {
            length: 2
        },
        'Packet Length': {
            length: 1
        },
        'Protocol Number': {
            length: 1
        },
        'Information Content': {
            "Date Time": {
                length: 6
            },
            "Quantity of GPS information satellites": {
                length: 1
            },
            "Latitude": {
                length: 4
            },
            "Longitude": {
                length: 4
            },
            "Speed": {
                length: 1
            },
            "Course, Status": {
                length: 2
            },
            "MCC": {
                length: 2
            },
            "MNC": {
                length: 1
            },
            "LAC": {
                length: 2
            },
            "Cell ID": {
                length: 3
            },
            "ACC": {
                length: 1
            },
            "Data Upload Mode": {
                length: 1
            },
            "GPS Real-time Re-upload": {
                length: 1
            },
            length: 29
        },
        'Serial Number': {
            length: 2
        },
        'Error Check': {
            length: 2
        },
        'Stop Bit': {
            length: 2
        }
    }
}
module.exports = protocols