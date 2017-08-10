const express = require('express')
const api = express.Router()
const verifyToken = require('../../lib/verify_token').verifyToken

const chats = require('../../app/controllers/chats_controller')

api.get('/chats', verifyToken, chats.index)
api.post('/chats', verifyToken, chats.create)

module.exports = api
