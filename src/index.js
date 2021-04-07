const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const generateMessage = require('./utils/messages')
const { addUser, getUserInRoom, removeUser, getUser} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

  

app.use(express.static(path.join(__dirname, '../public')))


io.on('connection', (socket) => {


    socket.on('join', (formFields, callback) => {
        const { error, user } = addUser({ id: socket.id, ...formFields })
        
        if (error) return callback(error)

        socket.join(user.room)
        socket.emit('message', { message: 'welcome to the chat app', info: 'welcome' })
        socket.broadcast.to(user.room).emit('message', { message: `${user.username} has joined`, info: 'joined' })

        io.to(user.room).emit('updateUsersList', {
            users: getUserInRoom(user.room)
        })

        callback()
    })
    socket.on('clientMessage', (msg, callback) => {
        const user =  getUser(socket.id)
        const filter = new Filter()
        if (msg == '') return callback({ message: 'Message can not be empty', info: 'error' })
        if (filter.isProfane(msg)) return callback({ message: 'Profanity is not allowed.', info: 'error' })

        io.to(user.room).emit('serverBroadcast', generateMessage(user.username, filter.clean(msg)))
        callback()

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', { message: `${user.username} has left the chat.`, info: 'left' })
            io.to(user.room).emit('updateUsersList', {
                users: getUserInRoom(user.room)
            })
        }
    })

    socket.on('location', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', generateMessage(user.username, `<a href='${position}' target='_blank'>Here is my location.</a>`))
        callback({ message: 'Location shared.', info: 'sent' })

    })


})





server.listen(process.env.PORT || 3000, () => {
    console.log(`SERVER LISTENING ON PORT ${process.env.PORT || 3000}...`)
})