'use strict'

const querystring = require('querystring')
const HttpError = require('../httpError')
const m = new Map()
m.set('application/json', parseJson)
m.set('application/x-www-form-urlencoded', parseUrlencoded)

class BodyParser {

  constructor () {}

  /**
   * @method parse
   * @param {string} encoding
   * @param {object} body
   * @param {function} callback
   * @callback {object} - parsed data
   * */

  parse (encoding, body, callback) {
    setImmediate(() => {
      if (!m.has(encoding)) {
        return callback(new HttpError(415, `Unsupported Media Type: ${encoding}!`))
      }

      m.get(encoding)(body.toString(), callback)
    })
  }
}

module.exports = BodyParser

/**
 * @function parseJson
 * @description request body parser for application/json
 * @param {string} buffer - concatenated request data chunks
 * @param {function} callback -
 * @callback {null|object} {object|void} - parsed body
 * */

function parseJson (buffer, callback) {
  setImmediate(() => {
    try {
      callback(null, JSON.parse(buffer.toString()))
    }
    catch (e) {
      callback(new HttpError(400, `Bad request!`))
    }
  })
}

/**
 * @function parseUrlencoded
 * @description request body parser for application/x-www-form-urlencoded
 * @param {object} buffer - request data chunks
 * @param {function} callback -
 * @callback {null|object} {object|void} - parsed body
 * */

function parseUrlencoded (buffer, callback) {
  setImmediate(() => {
    if (buffer.byteLength === 0) {
      return callback(null, {})
    }

    try {
      callback(null, querystring.parse(buffer.toString()))
    }
    catch (e) {
      callback(new HttpError(400, `Bad request!`))
    }
  })
}
