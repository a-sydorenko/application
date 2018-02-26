'use strict'

const querystring = require('querystring')
const url = require('url')
const HttpError = require('../httpError')
const BodyParser = require('../bodyParser')

class Router {

  constructor (app) {
    this.app = app
    this.bodyParser = new BodyParser()
  }

  handle (req, res) {
    req._ts = Date.now()
    req.url = url.parse(req.url)
    // Object.keys(req.url)
    // ['protocol','slashes','auth','host','port','hostname','hash','search','query','pathname','path','href']
    req.query = querystring.parse(req.url.query)

    switch (req.method) {
      case 'GET' : {
        this.defineRouteHandler(req, res)
        break
      }
      case 'POST' : {

        this.app.check(req, res, (err) => {
          if (err) {
            return this.app.errorHandler(err, req, res)
          }

          const body = []
          req.on('data', (chunk) => {
            body.push(chunk)
          })

          req.on('end', () => {
            this.bodyParser.parse(req.headers['content-type'], Buffer.concat(body), (err, body) => {

              if (err) {
                return this.app.errorHandler(err)
              }

              req.body = body
              this.defineRouteHandler(req, res)
            })
          })
        })

        break
      }
      default : {
        this.app.errorHandler(new HttpError(501), req, res)
      }
    }
  }

  defineRouteHandler (req, res) {
    const targetMap = this.app.maps[req.method]
    const route = targetMap !== void 0 && targetMap[req.url.pathname] !== void 0 ? targetMap[req.url.pathname] : null
    if (route === null) {
      return this.app.errorHandler(new HttpError(404), req, res)
    }

    this.execute(req, res, route.middlewares)
  }

  /**
   * @function execute
   * @description - execute each middleware
   * @param {object} req - current request object
   * @param {object} res - current response object
   * @param {object} middlewares - current route middlewares
   * @param {number} marker - index of current used middleware
   * @returns {function} - request handler
   * */

  execute (req, res, middlewares, marker = 0) {

    while (middlewares[marker]) {

      middlewares[marker](req, res, (err) => {
        if (err) {
          return this.app.errorHandler(err, req, res)
        }

        this.execute(req, res, middlewares, ++marker)
      })
    }
  }
}

module.exports = Router
