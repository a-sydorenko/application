'use strict'

const http = require('http')
const { expect } = require('chai')
const BodyParser = require('../models/bodyParser')

const bp = new BodyParser()
const data = JSON.stringify({ application: 1 })
const options = {
  hostname: '127.0.0.1',
  port: 1717,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}

describe(`BodyParser tests`, () => {

  it(`should correctly define request content-type and parse it`, function (done) {

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
})
