const models = require('../models')

class ChatsController {

  static index(req, res, next) {
    models.Chat.findAll()
      .then(chats => res.json(chats))
      .catch(err => res.status(400).json({ message: err.message }))
  }

  static create(req, res, next) {
    let finding  = models.User.findOne({ where: { id: req.user.id } })
    let creating = finding.then(user => user.createChat({ userId: user.id }))
    Promise.all([finding, creating]).then(values => {
      let chat = values[1]
      res.json(chat)
    })
    .catch(err => res.status(422).json({ message: err.message }))
  }

}

module.exports = ChatsController
