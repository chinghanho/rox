const jwt = require('jsonwebtoken')

/**
 * Verify JWT token.
 */
exports.verifyToken = function(req, res, next) {
  let token = req.headers['x-access-token']
  jwt.verify(token, req.app.get('secret'), (err, decoded) => {
    if (err) {
      res.status(401).json({ message: err.message })
    } else {
      req.decoded = decoded
      next()
    }
  })
}
