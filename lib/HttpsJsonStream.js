var https = require('https')
var PassThrough = require('stream').PassThrough
var util = require('util')

var sculpt = require('sculpt')

module.exports = HttpsJsonStream
util.inherits(HttpsJsonStream, PassThrough)
function HttpsJsonStream(requestArgs, delimiter) {
  PassThrough.call(this, {objectMode: true})

  this.requestArgs = requestArgs
  this.delimiter = delimiter || '\r\n'
}

HttpsJsonStream.prototype.createReadStream = function () {
  var handleError = this.emit.bind(this, 'error')

  https.get(this.requestArgs, function (response) {
    response.on('error', handleError)

    // Unsuccessful request
    if (response.statusCode >= 300) {
      // This is otherwise synchronous
      return process.nextTick(function () {
        var err = new Error('HTTP error code ' + response.statusCode)
        handleError(err)
      })
    }

    response                             .on('error', handleError)
      .pipe(sculpt.split(this.delimiter)).on('error', handleError)
      // https://dev.twitter.com/docs/streaming-apis/messages#Blank_lines
      .pipe(sculpt.filter(function (line) {
        return !! line.trim()
      }))                                .on('error', handleError)
      .pipe(sculpt.map(JSON.parse))      .on('error', handleError)
      .pipe(this)
  }.bind(this)).on('error', handleError)

  return this
}
