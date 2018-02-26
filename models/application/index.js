'use strict'

const querystring = require('querystring')
const url = require('url')
const HttpError = require('../httpError')
const BodyParser = require('../bodyParser')
const { getIp } = require('../../lib')

class Application {

  constructor () {

    this.bodyParser = new BodyParser()
    this.handle = handle.bind(this)
    this.maps = {
      GET: {},
      POST: {}
    }
  }

  // * * * * * * * * * * * * SET UP

  assign (method, path, ...middlewares) {
    if (this.maps[method][path]) {
      throw Error(`Duplicate declaration of ${method} route: '${path}'!`)
    }

    if (!middlewares.length) {
      throw Error(`No one middleware of ${method} route: '${path}' was detected!`)
    }

    middlewares.forEach((func, i) => {
      if (!(func instanceof Function)) {
        throw Error(`${i} argument of ${method} route: '${path}' middlewares is not a function!`)
      }
    })
    this.maps[method][path] = {}
    this.maps[method][path].middlewares = middlewares
  }

  get (path, ...middlewares) {
    this.assign('GET', path, ...middlewares)
  }

  post (path, ...middlewares) {
    this.assign('POST', path, ...middlewares)
  }

  pre (func) {
    if (func instanceof Function) {
      this.check = func
    }
  }

  use (func) {
    if (func instanceof Function) {
      this.errorHandler = func
    }
  }

  // * * * * * * * * * * * * DEFAULT MIDDLEWARES

  check (req, res, next) {
    next()
  }

  /**
   * @method errorHandler
   * @param {object} err - current request error
   * @param {object} req - current request object
   * @param {object} res - current response object
   * @returns {void} - request handler
   * */

  errorHandler (err, req, res) {
    // if (err.status === 404 || err.status === 415 || err.status === 501) {
    //   this.watch(err, req)
    // }

    res.writeHead(err.status !== void 0 ? err.status : 500)
    res.write(err.message !== void 0 ? err.message : '')
    res.end()
  }

  // * * * * * * * * * * * * ATTACK WATCHER

  watch (err, req) {
    console.error(`${err.status}|url.path: ${req.url.path}|ip: ${getIp(req)}`)
  }

  // * * * * * * * * * * * * ROUTER

  /**
   * @method defineRouteHandler
   * @description - execute each middleware
   * @param {object} req - current request object
   * @param {object} res - current response object
   * @returns {void} - request handler
   * */

  defineRouteHandler (req, res) {
    const targetMap = this.maps[req.method]
    const route = targetMap[req.url.pathname] !== void 0 ? targetMap[req.url.pathname] : null
    if (route === null) {
      return this.errorHandler(new HttpError(404), req, res)
    }

    this.execute(req, res, route.middlewares)
  }

  /**
   * @method execute
   * @description - execute each middleware
   * @param {object} req - current request object
   * @param {object} res - current response object
   * @param {object} middlewares - current route pathname middlewares
   * @param {number} marker - index of current used middleware
   * @returns {function} - request handler
   * */

  execute (req, res, middlewares, marker = 0) {

    if (marker < middlewares.length) {
      middlewares[marker](req, res, (err) => {
        if (err) {
          return this.errorHandler(err, req, res)
        }

        return this.execute(req, res, middlewares, ++marker)
      })
    }
  }
}

module.exports = Application

/**
 * @method handle
 * @param {object} req - current request object
 * @param {object} res - current response object
 * @returns {void}
 * */

function handle (req, res) {
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

      this.check(req, res, (err) => {
        if (err) {
          return this.errorHandler(err, req, res)
        }

        const body = []
        req.on('data', (chunk) => {
          body.push(chunk)
        })

        req.on('end', () => {
          this.bodyParser.parse(req.headers['content-type'], Buffer.concat(body), (err, body) => {

            if (err) {
              return this.errorHandler(err, req, res)
            }

            req.body = body
            this.defineRouteHandler(req, res)
          })
        })
      })

      break
    }
    default : {
      this.errorHandler(new HttpError(501, `Not implemented!`), req, res)
    }
  }
}