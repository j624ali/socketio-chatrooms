const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { fileURLToPath } = require('url')
const generateMessage = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))


io.on('connection', (socket) => {
    socket.emit('message', 'welcome to the chat app')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('clientMessage', (msg, callback) => {
        const filter = new Filter()
        if (msg == '') return callback('Message can not be empty')
        if (filter.isProfane(msg)) return callback('Profanity is not allowed.')

        io.emit('serverBroadcast', generateMessage(filter.clean(msg)))
        callback()

    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat.')
    })

    socket.on('location', (position, callback) => {
        io.emit('location', generateMessage(`<a href='${position}' target='_blank'>Here is my location.</a>`))
        callback('Location shared.')

    })


})





server.listen(process.env.PORT || 3000, () => {
    console.log(`SERVER LISTENING ON PORT ${process.env.PORT || 3000}...`)
})