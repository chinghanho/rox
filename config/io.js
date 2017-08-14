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
        socket._user = user
        return next()
      })
    })
  })

  io.on('connection', socket => {

    models.User.findById(socket._user.id).then(user => {
      user.touch(true)
    })

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

    socket.on('createchat', (title, next) => {
      models.User.findById(socket._user.id).then(user => {
        user.createChat({ userId: user.id, title, membersCount: 1 }).then(chat => {
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

    socket.on('sendmessage', (uuid, message) => {
      models.Chat.findOne({ where: { uuid } })
        .then(chat => chat.touch().save())
        .then(chat => {
          io.to(uuid)
            .emit('newmessage', msg({
              text: message,
              chatID: chat.uuid,
              sender: {
                id: socket._user.id,
                login: socket._user.login
              },
              type: 'human'
            }))
        })
    })

    socket.on('disconnect', () => {
      models.User.findById(socket._user.id).then(user => {
        user.touch(false)
      })
    })
  })

}
