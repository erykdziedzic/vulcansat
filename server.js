const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 5000
const server = app.listen(port, () => console.log(`Listening on port ${port}`))
const io = require('socket.io')(server)
const bodyParser = require('body-parser')

const serialInputPath = '/dev/serial/by-id/usb-Unknown_Arduino_M0_4306D42D5050323034202020FF090F1D-if00'

app.use(express.static(path.join(__dirname, 'client/build')))
app.use(bodyParser.json())

app.post('/record', (req, res) => {
  const records = fs.existsSync('records.json') ? JSON.parse(fs.readFileSync('records.json')) : []
  records.push(req.body)
  fs.writeFileSync('records.json', JSON.stringify(records))
  res.end()
})

app.post('/record/rename', (req, res) => {
  const records = fs.existsSync('records.json') ? JSON.parse(fs.readFileSync('records.json')) : []
  const renameIndex = records.findIndex((record) => record.title === req.body.old)
  console.log(renameIndex)
  // records.push(req.body)
  // fs.writeFileSync('records.json', JSON.stringify(records))
  res.end()
})

app.get('/record', (req, res) => {
  const records = fs.existsSync('records.json') ? JSON.parse(fs.readFileSync('records.json')) : '[]'
  res.json(records)
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'))
  })
} else {
  app.use(express.static(path.join(__dirname, 'client/public')))
  app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '/client/public/index.html')) })
}

const SerialPort = require('serialport')
const { Readline } = SerialPort.parsers
let portSerial
let parser
io.on('connection', (socket) => {
  console.log(`Someone connected. Socket: ${socket}`)
})

if (fs.existsSync(serialInputPath)) {
  portSerial = new SerialPort(serialInputPath)
  portSerial.on('open', () => console.log('ok'))
  parser = portSerial.pipe(new Readline({ delimiter: ';' }))
  // hour, minute, second, temperatureDS, temperatureBMP, pressureBMP, altitudeBMP, latitudeGPS
  // longitudeGPS, voltage, photores, mpu1, mpu2, mpu3, mp4

  let table = []
  parser.on('data', (data) => {
    console.log(data)
    let label
    if (table.length < 15) {
      switch (table.length) {
        case 0:
          label = 'hour'
          break
        case 1:
          label = 'minute'
          break
        case 2:
          label = 'second'
          break
        case 3:
          label = 'temperatureDS'
          break
        case 4:
          label = 'temperatureBMP'
          break
        case 5:
          label = 'pressureBMP'
          break
        case 6:
          label = 'altitudeBMP'
          break
        case 7:
          label = 'latitudeGPS'
          break
        case 8:
          label = 'longitudeGPS'
          break
        case 9:
          label = 'voltage'
          break
        case 10:
          label = 'photores'
          break
        case 11:
          label = 'mpu1'
          break
        case 12:
          label = 'mpu2'
          break
        case 13:
          label = 'mpu3'
          break
        case 14:
          label = 'mpu4'
          break
        default:
      }
      let newData
      if (label) {
        newData = {}
        newData[label] = data
      }
      table.push(newData)
    } else {
      console.log(table)
      io.sockets.emit('data', { data: table })
      table = []
    }
  })
} else {
  console.log('Device not connected! Random data')
  let height = 400
  setInterval(() => {
    const now = new Date()
    io.sockets.emit('data',
      {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        temperatureDS: 17 + Math.floor(Math.random() * 5),
        temperatureBMP: 17 + Math.floor(Math.random() * 2),
        pressureBMP: 1024 + Math.floor(Math.random() * 30),
        altitudeBMP: --height,
        latitudeGPS: 50.04 + Math.random() / 1000,
        longitudeGPS: 19.92 + Math.random() / 1000,
        voltage: 4,
        photores: 0,
        mpu1: 0,
        mpu2: 0,
        mpu3: 0,
        mpu4: 0
      })
  },
  1000)
}
