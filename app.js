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

db.defaults({users: [
    {
        name: 'Grandma',
        rsvp: true
    },
    {
        name: 'Austin',
        rsvp: true
    },
    {
        name: 'Nicole',
        rsvp: true
    },
    {
        name: 'Chris',
        rsvp: true
    },
    {
        name: 'Erin',
        rsvp: true
    },
    {
        name: 'Russell',
        rsvp: true
    },
    {
        name: 'Kristin',
        rsvp: true
    },
    {
        name: 'Dale',
        rsvp: true
    },
    {
        name: 'Leanne',
        rsvp: true
    },
    {
        name: 'Jared',
        rsvp: true
    },
    {
        name: 'Allison',
        rsvp: false
    },
    {
        name: 'Medora',
        rsvp: false
    }
]}).write()

io.on('connection', socket => {
    socket.on('ping', () => {
        console.log('ping received')
        socket.emit('ping')
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
    })

})

server.listen(port, () => console.log('listening on ' + port))
