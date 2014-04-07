var PROTOCOL = 'https'
var API_VERSION = '1.1'
var FORMAT = 'json'
var DELIMITER = '\r\n'

var _USER_TYPE = 'user'
var _PUBLIC_PATH_BASE = 'statuses'

function getHost(type) {
  var subdomain = type === _USER_TYPE ? 'userstream' : 'stream'
  return subdomain + '.twitter.com'
}

// Public streams have longer paths than user streams
function getPath(type) {
  var path = ''
  var extension = type + '.' + FORMAT

  if (type !== _USER_TYPE) {
    path = '/' + _PUBLIC_PATH_BASE
  }

  path = '/' + API_VERSION + path

  return path + '/' + extension
}

module.exports = function (type) {
  return {
    delimiter: DELIMITER,
    protocol: PROTOCOL,
    host: getHost(type),
    path: getPath(type)
  }
}
