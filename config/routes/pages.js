const express = require('express')
const pages = express.Router()

const auth = require('../../app/controllers/authenticate_controller')

pages.get('/', (req, res, next) => {
  res.json({
    message: 'GET / 200 OK Hello World!'
  })
})

pages.post('/authenticate', auth.authenticate)

module.exports = pages
