const models = require('../app/models')
const jwt = require('jsonwebtoken')
const msg = require('../lib/message')

module.exports = function (app, io) {

  io.use((socket, next) => {
    jwt.verify(socket.handshake.query.token, app.get('secret'), (err, decoded) => {
      if (err) {
        return next(new Error(err.message))
      }
      models.User.findById(decoded.id).then(user => {
        user.touch(true)
        socket.user = user
        return next()
      })
    })
  })

  io.on('connection', socket => {

    socket.on('getchats', next => {
      socket.user.getChats({ include: [{ model: models.User, as: 'Members' }] })
        .then(chats => {
          chats.forEach(chat => {
            socket.join(chat.uuid, () => next(chats))
          })
        })
    })

    socket.on('createchat', (title, next) => {
      let user = socket.user
      user
        .createChat({ userId: user.id, title, membersCount: 1 })
        .then(chat => socket.join(chat.uuid, () => next(chat)))
    })

    socket.on('joinroom', (uuid, next) => {
      let user = socket.user
      models.Chat.findOne({ where: { uuid } }).then(chat => {
        chat.addMembers([user])
          .then(() => chat.increment('membersCount'))
          .then(() => socket.join(chat.uuid, () => {
            next(chat)
            io.to(chat.uuid)
              .emit('newmessage', msg({
                text: `${user.login} joined this room`,
                chatID: chat.uuid,
                sender: null,
                type: 'sys'
              }))
          }))
      })
    })

    socket.on('messages.sendtext', (uuid, message) => {
      let user = socket.user
      models.Chat.findOne({ where: { uuid } })
        .then(chat => chat.touch().save())
        .then(chat => {
          io.to(uuid)
            .emit('newmessage', msg({
              text: message,
              chatID: chat.uuid,
              sender: {
                id: user.id,
                login: user.login
              },
              type: 'human'
            }))
        })
    })

    socket.on('disconnect', () => {
      socket.user.touch(false)
    })
  })

}
