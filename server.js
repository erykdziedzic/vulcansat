const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 8080
const server = app.listen(port, () => console.log(`Listening on port ${port}`))
const io = require('socket.io')(server)
const bodyParser = require('body-parser')

const serialInputPath = '/dev/ttyUSB0'

app.use(express.static(path.join(__dirname, 'client/build')))
app.use(bodyParser.json())

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
  parser = portSerial.pipe(new Readline({ delimiter: '\r\n' }))
  parser.on('data', (data) => {
    console.log(data.split(';')[0])
    io.sockets.emit('data', { press: data.split(';')[0] })
  })
} else {
  console.log('Device not connected! Random data')
  let height = 100
  setInterval(() => io.sockets.emit('data',
    {
      height: height > 0 ? --height : 0,
      temperature: 17 + Math.floor(Math.random() * 5),
      position: { lat: 50.04 + Math.random() / 100, lng: 19.92 + Math.random() / 100 }
    }),
  1000)
}
