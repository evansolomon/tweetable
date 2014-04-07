var https = require('https')
var querystring = require('querystring')
var PassThrough = require('stream').PassThrough

var sculpt = require('sculpt')
var OAuth = require('oauth').OAuth

var config = {
  oauth: {
    version: '1.0',
    signatureMethod: 'HMAC-SHA1',
  },
  twitter: {
    protocol: 'https',
    host: 'stream.twitter.com',
    version: '1.1',
    endpoint: 'statuses',
    format: 'json',
    delimiter: '\r\n'
  }
}

/**
 * Create a new stream of tweet objects.
 *
 * @param {object} api Twitter API credentials.
 * @param {string} api.key Twitter API key.
 * @param {string} api.secret Twitter API secret.
 * @param {object} access Twitter oAuth access credentials.
 * @param {string} access.token oAuth access token.
 * @param {string} access.secret oAuth access key.
 * @param {string} type Public stream API type.
 * @param {object=} params Params for stream, only used for filter streams.
 *
 * @return {stream.PassThrough} Stream of matching tweet objects.
 */
module.exports = function (api, access, type, params) {
  var tweetStream = new PassThrough({objectMode: true})
  var handleError = tweetStream.emit.bind(tweetStream, 'error')

  var oauth = new OAuth(
    null,                        // Request URL, not used
    null,                        // Access URL, not used
    api.key,                     // Twitter API key
    api.secret,                  // Twitter API secret
    config.oauth.version,
    null,                        // Callback URL, not used
    config.oauth.signatureMethod
  )

  var twitter = config.twitter
  var opts = {
    host: twitter.host,
    path: '/' + twitter.version + '/' + twitter.endpoint + '/' + type + '.' + twitter.format,
    headers: {}
  }

  if (params) {
    opts.path += '?' + querystring.stringify(params)
  }

  var url = config.twitter.protocol + '://' + opts.host + opts.path
  var auth = oauth.authHeader(url, access.token, access.secret)
  opts.headers.Authorization = auth

  https.get(opts, function (response) {
    // Unsuccessful request
    if (response.statusCode >= 300) {
      // This is otherwise synchronous
      return process.nextTick(function () {
        var err = new Error('Response error code ' + response.statusCode + ' from Twitter API')
        handleError(err)
      })
    }

    response                                       .on('error', handleError)
      .pipe(sculpt.split(config.twitter.delimiter)).on('error', handleError)
      .pipe(sculpt.map(JSON.parse))                .on('error', handleError)
      .pipe(tweetStream)
  }).on('error', handleError)

  return tweetStream
}
