const debug = true
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    debug && console.log('---connection')
    socket.on('join-room', (roomId, userId) => {
        debug && console.log('---join-room', roomId, userId)
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('disconnect', _ => {
            debug && console.log('---user-disconnected')
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(4445)
