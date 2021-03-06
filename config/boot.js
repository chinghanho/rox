const fs         = require('fs')
const path       = require('path')
const express    = require('express')
const app        = express()
const http       = require('http').Server(app)
const io         = require('socket.io')(http)
const morgan     = require('morgan')
const ejs        = require('ejs').renderFile
const bodyParser = require('body-parser')
const env        = process.env.NODE_ENV || 'development'

// Specify running port from environment variable, ex:
//
// ``` js
// PORT=8080 node config/boot.js
// ```
//
// Open the browser and visit http://127.0.0.1:8080.
//
app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json()) // for parsing application/json

if (env !== 'test') {
  app.use(morgan('dev'))
}

// Register ejs as template engine.
app.set('views', path.join(__dirname, '../app/views'))
app.engine('ejs', ejs)
app.set('view engine', 'ejs')

app.set('json spaces', 2)
app.set('secret', require('./secret.json').secret)

// mount the router
app.use(express.static(path.join(__dirname, '../public')))
var routes = require('./router')
routes(app)

const connect = require('./io')
connect(app, io)

// Error handling
app.use((err, req, res, next) => {
  res.status(500).send(err.message)
})

app.db = require('../app/models')

// Run! Express run!
var server = http.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + server.address().port)
})

module.exports = app
