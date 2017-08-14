const includes = require('lodash/includes')

module.exports = function ({ text, sender, chatID, type } = { sender: null }) {
  if (!validatesTypes(type)) {
    throw Error('Invalid message type')
  }
  return { text, sender, type, chatID }
}

// Validates the type of the message.
// The type must be one of following types:
//
//    sys: send from system
//    human: send from a human
//    bot: send from a bot
//
function validatesTypes(type) {
  return includes(['sys', 'human', 'bot'], type)
}
