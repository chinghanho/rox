const express = require('express')
const api = express.Router()
const verifyToken = require('../../lib/verify_token').verifyToken

const users = require('../../app/controllers/users_controller')

api.get('/', (req, res, next) => {
  res.json({
    message: 'Hello world'
  })
})

api.get('/users', verifyToken, users.index)
api.get('/users/:id', verifyToken, users.show)
api.post('/users', verifyToken, users.create)
api.patch('/users/:id', verifyToken, users.update)
api.get('/users/:id/chats', verifyToken, users.chats)

module.exports = api
