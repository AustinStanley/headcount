const express = require('express')
const bodyParser = require('body-parser')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const app = express()
app.use(bodyParser.json())

const adapter = new FileAsync('db.json')
low(adapter)
    .then(db => {

        // GET /
        app.get('/', (req, res) => res.send(db.get('users')))

        // GET /users/:name
        app.get('/users/:name', (req, res) => {
            const user = db.get('users')
                .find({ name: req.params.name })
                .value()

            res.send(user)
        })

        // GET /headcount
        app.get('/headcount', (req, res) => {
            const count = db.get('users')
                .filter({ rsvp: true })
                .size()
                .value()

            res.send(count + '')
        })

        // POST /
        app.post('/', (req, res) => {
            db.get('users')
                .find({ name: req.body.name })
                .assign({ rsvp: req.body.rsvp })
                .write()
                .then(user => res.send(user))
        })

        return db.defaults({users: [
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
    })
    .then(() => {
        app.listen(80, () => console.log('headcount listening on port 80'))
    })
