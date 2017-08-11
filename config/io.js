const models = require('../app/models')
const jwt = require('jsonwebtoken')

module.exports = function (app, io) {

  io.use((socket, next) => {
    jwt.verify(socket.handshake.query.token, app.get('secret'), (err, decoded) => {
      if (err) {
        return next(new Error(err.message))
      }
      socket._user = decoded
      return next()
    })
  })

  io.on('connection', socket => {

    socket.on('getchats', next => {
      models.User.findById(socket._user.id).then(user => {
        user.getChats().then(chats => {
          chats.forEach(chat => {
            socket.join(chat.uuid, () => {
              next(chats)
            })
          })
        })
      })
    })

    socket.on('createchat', next => {
      models.User.findById(socket._user.id).then(user => {
        user.createChat({ userId: user.id }).then(chat => {
          socket.join(chat.uuid, () => {
            next(chat)
          })
        })
      })
    })

    socket.on('joinroom', (uuid, next) => {
      models.Chat.findOne({ where: { uuid } }).then(chat => {
        socket.join(chat.uuid, () => {
          next(chat)
        })
      })
    })

    socket.on('sendmessage', (uuid, message) => {
      io.to(uuid).emit('newmessage', message)
    })

    socket.on('disconnect', () => {
      console.log('a user disconnected')
    })
  })

}
