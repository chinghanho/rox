const test = require('ava')
const request = require('supertest')
const app = require('../config/boot')
const jwt = require('jsonwebtoken')

test.beforeEach(async t => {
  let login = `foo${Math.floor(Math.random() * 100000)}`
  let password = '12345678'
  let user = await app.db.User.create({
    login: login,
    email: `${login}@bar.com`,
    password: password
  })
  user.password = password

  t.context.user = user
})

test('POST /authenticate', async t => {
  let user = t.context.user
  const res = await request(app).post('/authenticate').send({ login: user.login, password: user.password })
  const _user = await app.db.User.findOne({ where: { login: user.login } })
  const decoded = await jwt.verify(res.body.token, app.get('secret'))
  t.is(res.statusCode, 200)
  t.is(decoded.id, _user.id)
})

test('GET /api/v1', async t => {
  const res = await makeRequest('/api/v1', t.context)
  t.is(res.body.message, 'Hello world')
})

test('GET /api/v1/users', async t => {
  const res = await makeRequest('/api/v1/users', t.context)
  t.is(res.statusCode, 200)
})

test('GET /api/v1/users/:id', async t => {
  t.plan(2)
  const res = await makeRequest(`/api/v1/users/${t.context.user.id}`, t.context)
  t.is(res.statusCode, 200)
  t.is(res.body.login, t.context.user.login)
})

test('POST /api/v1/users with invalid login should be failed', async t => {
  t.plan(2)

  const loginTooShort = await makeRequest('/api/v1/users', t.context, 'post',
    { login: 'a', email: 'woo@foo.bar', password: '12345678' })

  const loginTooLong = await makeRequest('/api/v1/users', t.context, 'post',
    { login: 'a'.repeat(21), email: 'qoo@foo.bar', password: '12345678' })

  t.is(loginTooShort.statusCode, 422)
  t.is(loginTooLong.statusCode, 422)
})

test('POST /api/v1/users with invalid email should be failed', async t => {
  const res = await makeRequest('/api/v1/users', t.context, 'post',
    { login: 'moo', email: 'localhost', password: '12345678' })

  t.is(res.statusCode, 422)
})

test('POST /api/v1/users with duplicated data sould respond with 422', async t => {
  let contextUser = t.context.user
  const res = await makeRequest('/api/v1/users', t.context, 'post',
    { login: contextUser.login, email: contextUser.email, password: '12345678' })

  t.is(res.statusCode, 422)
})

test('POST /api/v1/users with valid params', async t => {
  t.plan(3)

  let login = `foo${Math.floor(Math.random() * 100000)}`
  let password = '12345678'
  let user = {
    login: login,
    email: `${login}@bar.com`,
    password: password
  }

  const res = await makeRequest('/api/v1/users', t.context, 'post', user)

  t.is(res.statusCode, 200)
  t.is(res.body.login, user.login)
  t.is(res.body.email, user.email)
})

test('PATCH /api/v1/users/:id with valid params', async t => {
  t.plan(3)

  const res = await makeRequest('/api/v1/users/1', t.context, 'patch',
    { login: 'foobar', email: 'bar@foo.com' })

  t.is(res.statusCode, 200)
  t.is(res.body.login, 'foobar')
  t.is(res.body.email, 'bar@foo.com')
})

async function makeRequest(url, context, method = 'get', body) {
  let user = context.user

  const auth = await request(app)
    .post('/authenticate')
    .send({ login: user.login, password: user.password })

  const req = request(app)[method](url)
    .set('Accept', 'application/json')
    .set('X-ACCESS-TOKEN', auth.body.token)

  const res = body ? req.send(body) : req

  return await res
}
