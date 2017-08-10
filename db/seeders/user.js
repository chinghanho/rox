const models = require('../../app/models')

models.User.create({
  login: 'foo',
  email: 'foo@bar.com',
  password: '12345678'
})
