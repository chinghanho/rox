const models = require('../app/models')
const jwt = require('jsonwebtoken')
const msg = require('../lib/message')

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
        user.createChat({ userId: user.id, membersCount: 1 }).then(chat => {
          socket.join(chat.uuid, () => {
            next(chat)
          })
        })
      })
    })

    socket.on('joinroom', (uuid, next) => {
      let findingChat = models.Chat.findOne({ where: { uuid } })
      let findingUser = models.User.findById(socket._user.id)

      Promise.all([findingChat, findingUser]).then(values => {
        let chat = values[0]
        let user = values[1]
        chat.addMembers([user])
          .then(() => chat.increment('membersCount'))
          .then(() => socket.join(chat.uuid, () => next(chat)))
      })
    })

    socket.on('sendmessage', (uuid, message) => {
      models.Chat.findOne({ where: { uuid } })
        .then(chat => chat.touch().save())
        .then(() => io.to(uuid).emit('newmessage', msg({ text: message, sender_id: socket._user.id })))
    })

    socket.on('disconnect', () => {
      console.log('a user disconnected')
    })
  })

}
