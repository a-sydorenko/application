'use strict'

const querystring = require('querystring')
const http = require('http')
const { expect } = require('chai')
const BodyParser = require('../models/bodyParser')

const bp = new BodyParser()
const hostname = '127.0.0.1'

describe(`BodyParser tests`, () => {

  it(`should correctly define 'application/json' content-type and parse it`, function (done) {
    const data = JSON.stringify({ application: 1 })
    const options = {
      hostname,
      port: 1717,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    http
      .createServer(function (req, res) {
        const body = []
        req
          .on('error', done)
          .on('data', chunk => body.push(chunk))
          .on('end', () => {

            bp.parse(req.headers['content-type'], body, (err, body) => {
              if (err) {
                return done(err)
              }

              expect(body).to.be.an('object')
              expect(body.application).to.equal(1)
              expect(JSON.stringify(body)).to.equal(data)
              res.end()
              done()
            })

          })
      })
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          res
            .on('data', c => {})
            .on('error', done)
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })

  it(`should correctly define 'application/x-www-form-urlencoded' content-type and parse it`, function (done) {
    const data = querystring.stringify({ application: 1, test: '1' })
    const options = {
      hostname,
      port: 1718,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    http
      .createServer(function (req, res) {
        const body = []
        req
          .on('error', done)
          .on('data', chunk => body.push(chunk))
          .on('end', () => {

            bp.parse(req.headers['content-type'], body, (err, body) => {
              if (err) {
                return done(err)
              }

              expect(body).to.be.an('object')
              expect(+body.application).to.equal(1)
              res.end()
              done()
            })

          })
      })
      .on('error', done)
      .listen(options.port, options.hostname, () => {

        const req = http.request(options, (res) => {
          res
            .on('data', c => {})
            .on('error', done)
            .setEncoding('utf8')
        })

        req.on('error', done)
        req.write(data)
        req.end()
      })
  })
})
