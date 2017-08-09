const pick   = require('lodash/pick')
const pickBy = require('lodash/pickBy')
const models = require('../models')

/**
 * @api {GET} /users Get users
 * @apiVersion 1.0.0
 * @apiName UserList
 * @apiGroup User
 *
 * @apiSuccess {Object[]} users       List of users.
 * @apiUse UserItem
 */
exports.index = (req, res, next) => {
  models.User.findAll().then(users => {
    let result = users.map(user => userData(user))
    res.json(result)
  })
}

/**
 * @api {GET} /users/:id Get user
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup User
 * @apiParam {Number} id Users unique ID.
 *
 * @apiUse UserItem
 *
 * @apiSuccessExample Success-Response:
 *
 *    HTTP/1.1 200 OK
 *    {
 *      "login": "foo",
 *      "email": "foo@bar.com"
 *    }
 *
 * @apiError message
 *
 * @apiErrorExample Error-Response:
 *   {
 *     "message": "User not found"
 *   }
 */
exports.show = (req, res, next) => {
  models.User.findById(req.params.id)
    .then(user => {
      user ? res.json(user) : res.json({ message: 'User not found' })
    })
    .catch(err => res.json({ message: err.message }))
}

/**
 * @api {POST} /users Create user
 * @apiVersion 1.0.0
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiUse UserItem
 *
 * @apiError (Error 422) message
 *
 * @apiErrorExample Error-Response:
 *   {
 *     "message": ""
 *   }
 */
exports.create = (req, res, next) => {
  models.User.create(userParams(req))
    .then(user => res.json(userData(user)))
    .catch(err => {
      let json = { message: err.message }
      if (err.errors && err.errors.length > 0) {
        json.errors = err.errors.map(_err => {
          return {
            "resource": "User",
            "field": _err.path,
            "code": "invalid"
          }
        })
      }
      res.status(422).json(json)
    })
}

/**
 * @api {PATCH} /users/:id Update user
 * @apiVersion 1.0.0
 * @apiName UpdateUser
 * @apiGroup User
 * @apiParam {Number} id The user ID.
 *
 * @apiUse UserItem
 *
 * @apiError (Error 422) message
 */
exports.update = (req, res, next) => {
  let finding = models.User.findById(req.params.id)

  let updaing = finding.then(user => {
    if (!user) {
      throw Error('User not found.')
    }

    return user.update(userParams(req))
  })

  Promise.all([finding, updaing])
    .then(values => {
      let user = values[1]
      res.json(userData(user))
    })
    .catch(err => {
      res.status(422)
      res.json({ message: err.message })
    })
}

/**
 * Sanitize the params for user before storing it in the database.
 *
 * @param  {Object} req Request object by Express
 * @return {Object}
 */
function userParams(req) {
  let data = pick(req.body, ['login', 'email', 'password'])
  return pickBy(data)
}

/**
 * @apiDefine UserItem
 *
 * @apiSuccess {String} user.id The user id
 * @apiSuccess {String} user.login The user login name
 * @apiSuccess {String} user.email The user email
 * @apiSuccess {String} user.updatedAt The user data last modified timestamp
 * @apiSuccess {String} user.createdAt The user data first created timestamp
 */

/**
 * Filter out the data for user.
 *
 * @param  {Object} data Raw data of the user that extracted from the database.
 * @return {Object}
 */
function userData(data) {
  return pick(data, ['id', 'login', 'email', 'updatedAt', 'createdAt'])
}
