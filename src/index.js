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
    socket.emit('message', { message: 'welcome to the chat app', info: 'welcome' })
    socket.broadcast.emit('message', { message: 'A new user has joined', info: 'joined' })

    socket.on('clientMessage', (msg, callback) => {
        const filter = new Filter()
        if (msg == '') return callback({ message: 'Message can not be empty', info: 'error' })
        if (filter.isProfane(msg)) return callback({ message: 'Profanity is not allowed.', info: 'error' })

        io.emit('serverBroadcast', generateMessage(filter.clean(msg)))
        callback()

    })

    socket.on('disconnect', () => {
        io.emit('message', { message: 'A user has left the chat.', info: 'left' })
    })

    socket.on('location', (position, callback) => {
        io.emit('location', generateMessage(`<a href='${position}' target='_blank'>Here is my location.</a>`))
        callback({ message: 'Location shared.', info: 'sent' })

    })


})





server.listen(process.env.PORT || 3000, () => {
    console.log(`SERVER LISTENING ON PORT ${process.env.PORT || 3000}...`)
})