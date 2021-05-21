# Concox Device Adapter

## Overview

Device Adapter for Concox devices written in Node.js with Express.js framework.

1. Receives & decodes the login packet using the concox protocol document
2. Responds to the login packet using the concox protocol document
3. Receives & decodes the heartbeat packet using the concox protocol document
4. Responds to the heartbeat packet using the concox protocol document
5. Receives & decodes the GPS location packet using the concox protocol document
6. Responds to GPS location packet using the concox protocol document
7. Saves GPS location packet in a file storage

## Installation & Local Run

Ensure you have node 12 or higher.

1. `npm install`
2. `npm start`

## Usage

### Optional Environment Variables
Please refer to the `config/default.json` file for default values
```
HOST=127.0.0.1
PORT=3000
```

### API Call

Visit the following URL to see the api endpoint docs.

```
http://127.0.0.1:3000/api-docs
```