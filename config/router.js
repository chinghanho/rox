const express = require('express')
const router = express.Router()

const pages = require('../app/controllers/pages_controller')
const auth = require('../app/controllers/authenticate_controller')

module.exports = app => {

  router.get('/', pages.index)
  router.post('/authenticate', auth.authenticate)

  app.use(router)

}
