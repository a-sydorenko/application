'use strict'

const http = require('http')
const { expect } = require('chai')
const Application = require('../models/application')
const app = new Application()

require('./source/routes')(app)

const hostname = '127.0.0.1'
const data = '{}'
const headers = {
  'Content-Type': 'application/json',
  'Content-Length': Buffer.byteLength(data)
}

describe(`Application tests`, () => {

  it(`should correctly define request path and return it into response`, function (done) {
    const options = { hostname, port: 1711, path: '/path1', method: 'POST', headers }

    http
      .createServer(app.router)
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          expect(res.statusCode).to.equal(200)

          const resp = []
          res
            .on('data', c => resp.push(c))
            .on('error', done)
            .on('end', () => {
              const response = resp.toString()
              expect(response).to.be.a('string')
              expect(JSON.parse(response).pathname).to.equal(options.path)

              done()
            })
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })

  it(`should return 403 http error`, function (done) {
    const options = { hostname, port: 1712, path: '/path2', method: 'GET', headers }

    http
      .createServer(app.router)
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          expect(res.statusCode).to.equal(403)

          const resp = []
          res
            .on('data', c => resp.push(c))
            .on('error', done)
            .on('end', done)
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })

  it(`should return 404 http error`, function (done) {
    const options = { hostname, port: 1713, path: '/path3', method: 'GET', headers }

    http
      .createServer(app.router)
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          expect(res.statusCode).to.equal(404)

          const resp = []
          res
            .on('data', c => resp.push(c))
            .on('error', done)
            .on('end', done)
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })

  it(`should return 501 http error`, function (done) {
    const options = { hostname, port: 1714, path: '/path2', method: 'PATCH', headers }

    http
      .createServer(app.router)
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          expect(res.statusCode).to.equal(501)

          const resp = []
          res
            .on('data', c => resp.push(c))
            .on('error', done)
            .on('end', done)
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })
})
