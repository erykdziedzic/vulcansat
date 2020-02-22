const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 8080
const server = app.listen(port, () => console.log(`Listening on port ${port}`))
const io = require('socket.io')(server)

const serialInputPath = '/dev/ttyUSB0'
app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/api/getList', (req, res) => {
  const list = ['item1', 'item2', 'item3']
  res.json(list)
  console.log('Sent list of items')
})

app.get('*', (req, res) => {
  res.status(404)
})

const SerialPort = require('serialport')
const { Readline } = SerialPort.parsers
let portSerial
let parser
if (fs.existsSync(serialInputPath)) {
  portSerial = new SerialPort(serialInputPath)
  parser = portSerial.pipe(new Readline({ delimiter: '\r\n' }))
  parser.on('data', (data) => {
    console.log(data.split(';')[0])
    io.sockets.emit('data', { press: data.split(';')[0] })
  })

  io.on('connection', (socket) => {
    console.log(`Someone connected. Socket: ${socket}`)
  })
}
