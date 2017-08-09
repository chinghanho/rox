const test = require('ava')
const request = require('supertest')
const app = require('../config/boot')
const jwt = require('jsonwebtoken')

test.before(async t => {
  await app.db.User.sync({ force: true }).then(() => {
    app.db.User.create({ login: 'foo', email: 'foo@bar.com', password: '12345678'})
  })
})

test.after(async t => {
  await app.db.sequelize.drop()
})

test('POST /authenticate', async t => {
  const res = await request(app).post('/authenticate').send({ login: 'foo', password: '12345678' })
  const user = await app.db.User.findOne({ where: { login: 'foo' } })
  const decoded = await jwt.verify(res.body.token, app.get('secret'))
  t.is(res.statusCode, 200)
  t.is(decoded.id, user.id)
})

test('GET /api/v1', async t => {
  const res = await makeRequest('/api/v1')
  t.is(res.body.message, 'Hello world')
})

test('GET /api/v1/users', async t => {
  t.plan(3)
  const res = await makeRequest('/api/v1/users')
  t.is(res.statusCode, 200)
  t.is(res.body[0].login, 'foo')
  t.is(res.body[0].email, 'foo@bar.com')
})

test('GET /api/v1/users/:id', async t => {
  t.plan(2)
  const res = await makeRequest('/api/v1/users/1')
  t.is(res.statusCode, 200)
  t.is(res.body.login, 'foo')
})

test('POST /api/v1/users with invalid login should be failed', async t => {
  t.plan(2)

  const loginTooShort = await makeRequest('/api/v1/users', 'post',
    { login: 'a', email: 'woo@foo.bar', password: '12345678' })

  const loginTooLong = await makeRequest('/api/v1/users', 'post',
    { login: 'a'.repeat(21), email: 'woo@foo.bar', password: '12345678' })

  t.is(loginTooShort.statusCode, 422)
  t.is(loginTooLong.statusCode, 422)
})

test('POST /api/v1/users with invalid email should be failed', async t => {
  const res = await makeRequest('/api/v1/users', 'post',
    { login: 'moo', email: 'localhost', password: '12345678' })

  t.is(res.statusCode, 422)
})

test('POST /api/v1/users with duplicated data sould respond with 422', async t => {
  const res = await makeRequest('/api/v1/users', 'post',
    { login: 'foo', email: 'foo@bar.com', password: '12345678' })

  t.is(res.statusCode, 422)
})

test('POST /api/v1/users with valid params', async t => {
  t.plan(2)

  let user = {
    login: 'bar',
    email: 'bar@example.com',
    password: '12345678'
  }

  const res = await makeRequest('/api/v1/users', 'post', user)

  t.is(res.body.login, user.login)
  t.is(res.body.email, user.email)
})

test('PATCH /api/v1/users/:id with valid params', async t => {
  t.plan(3)

  const res = await makeRequest('/api/v1/users/1', 'patch',
    { login: 'foobar', email: 'bar@foo.com' })

  t.is(res.statusCode, 200)
  t.is(res.body.login, 'foobar')
  t.is(res.body.email, 'bar@foo.com')
})

async function makeRequest(url, method = 'get', body) {
  const auth = await request(app)
    .post('/authenticate')
    .send({ login: 'foo', password: '12345678' })

  const req = request(app)[method](url)
    .set('Accept', 'application/json')
    .set('X-ACCESS-TOKEN', auth.body.token)

  const res = body ? req.send(body) : req

  return await res
}
