const jwt = require('jsonwebtoken')
const models = require('../models')

/**
 * @api {POST} /authenticate Authenticate the user by given login and password.
 * @apiVersion 1.0.0
 * @apiName AuthenticateUser
 * @apiGroup General
 *
 * @apiParam {String} login    The user login name.
 * @apiParam {String} password The password of the user.
 */
exports.authenticate = (req, res, next) => {
  return models.User.findOne({ where: { login: req.body.login } })
    .then(user => {
      if (user && user.isAuthenticate(req.body.password)) {
        let payload = { id: user.id }
        let secret  = req.app.get('secret')
        let options = { algorithm: 'HS256' }
        let token   = jwt.sign(payload, secret, options)
        res.json({
          status: 200,
          message: 'Have fun with your token. ;)',
          token: token
        })
      } else {
        res.status(403).json({ status: 403, message: 'incorrect login/password' })
      }
    })
    .catch(err => {
      res.status(422).json({ message: err.message })
    })
}
