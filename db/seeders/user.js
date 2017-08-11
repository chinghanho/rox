const models = require('../../app/models')

models.User.create({
  login: 'foo',
  email: 'foo@bar.com',
  password: '12345678'
})

models.User.create({
  login: 'bar',
  email: 'bar@foo.com',
  password: '12345678'
})
