'use strict'

const HttpError = require('../../models/httpError')

module.exports = function (app) {
  app.post('/path1', m1, (req, res, next) => {

    res.writeHead(200)
    res.write(JSON.stringify({ pathname: req.url.pathname }))
    res.end()
  })

  app.options('/*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    res.end()
  })

  app.put('/*', m1, (req, res, next) => {

    res.writeHead(200)
    res.write(JSON.stringify({ pathname: req.url.pathname }))
    res.end()
  })

  app.get('/path2', m2, (req, res, next) => res.end())
}

function m1 (req, res, next) {
  next()
}

function m2 (req, res, next) {
  next(new HttpError(403, 'Forbidden!'))
}
