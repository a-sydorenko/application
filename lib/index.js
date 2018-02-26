'use strict'

module.exports = {
  getIp
}

/**
 * @function getIp
 * @description get ip address from request
 * @param {object} req
 * @param {object} req.headers
 * @param {object|void} req.socket
 * @param {string} req.socket.remoteAddress
 * @param {object|void} req.connection
 * @param {string} req.connection.remoteAddress
 * @param {object|void} req.connection.socket
 * @param {string} req.connection.socket.remoteAddress
 * @returns {string}
 */

function getIp (req) {
  return req.headers['x-forwarded-for'] ||
    req.socket !== void 0 && req.socket.remoteAddress ||
    (req.connection !== void 0 && (
      req.connection.remoteAddress ||
      req.connection.socket !== void 0 && req.connection.socket.remoteAddress)) || ''
}


