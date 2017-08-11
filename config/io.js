const models = require('../app/models')
const jwt = require('jsonwebtoken')

module.exports = function (app, io) {

  io.use((socket, next) => {
    let token = socket.handshake.query.token

    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) {
        return next(new Error(err.message))
      }
      socket._user = decoded
      return next()
    })
  })

  io.on('connection', socket => {

    console.log('user create connection')

    io.emit('welcome', 'global welcome')
    socket.emit('welcome', 'Hello socket.io')

    socket.on('getchats', next => {
      models.User.findById(socket._user.id).then(user => {
        user.getChats().then(chats => next(chats))
      })
    })

    socket.on('createchat', next => {
      models.User.findById(socket._user.id).then(user => {
        user.createChat({ userId: user.id }).then(chat => next(chat))
      })
    })

    socket.on('disconnect', () => {
      console.log('a user disconnected')
    })
  })

}
