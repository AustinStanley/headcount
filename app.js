const express = require('express')
const bodyParser = require('body-parser')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = 8000;

app.use(bodyParser.json())

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ users: [] }).write()

io.on('connection', socket => {
    socket.on('ping', () => {
        console.log('ping received')
        socket.emit('ping')
    })

    socket.on('register', data => {
        console.log('register: ' + data.name)
        const existing = db.get('users')
            .find({ name: data.name })
            .value()

        if (!existing) {
            db.get('users')
                .push({ name: data.name, rsvp: true })
                .write()
        }
        socket.emit('register')
    })

    socket.on('getall', () => {
        console.log('getall')
        socket.emit('getall', db.get('users'))
    })

    socket.on('getnames', () => {
        console.log('getnames')
        let names = db.get('users')
            .map('name')
            .value()

        socket.emit('getnames', names)
    })

    socket.on('getcoming', () => {
        console.log('getcoming')
        let names = db.get('users')
            .filter({ rsvp: true })
            .map('name')
            .value()

        socket.emit('getcoming', names)
    })

    socket.on('getuser', data => {
        console.log('getuser: ' + data.name)
        socket.emit('getuser', db.get('users').find({ name: data.name }).value())
    })

    socket.on('getheadcount', () => {
        console.log('getheadcount')
        socket.emit('getheadcount', db.get('users').filter({ rsvp: true }).size().value())
    })

    socket.on('rsvp', data => {
        console.log('rsvp: ' + data.name + ', ' + data.rsvp)
        db.get('users')
            .find({ name: data.name })
            .assign({ rsvp: data.rsvp })
            .write()

        socket.emit('rsvp', data)
        socket.broadcast.emit('update', db.get('users').filter({ rsvp: true }).size().value())
    })

})

server.listen(port, () => console.log('listening on ' + port))
