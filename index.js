var https = require('https')
var querystring = require('querystring')
var PassThrough = require('stream').PassThrough

var sculpt = require('sculpt')
var OAuth = require('oauth').OAuth

var config = {
  twitter: require('./config/twitter'),
  oauth: require('./config/oauth')
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
 * @param {string} type Stream API type.
 * @param {object=} params Params for stream, only used for filter and user streams.
 *
 * @return {stream.PassThrough} Stream of matching tweet objects.
 */
module.exports = function (api, access, type, params) {
  var tweetable = new PassThrough({objectMode: true})
  var handleError = tweetable.emit.bind(tweetable, 'error')

  var oauthConfig = config.oauth()
  var oauth = new OAuth(
    null,                        // Request URL, not used
    null,                        // Access URL, not used
    api.key,                     // Twitter API key
    api.secret,                  // Twitter API secret
    oauthConfig.version,
    null,                        // Callback URL, not used
    oauthConfig.signatureMethod
  )

  var twitterConfig = config.twitter(type)
  var opts = {
    host: twitterConfig.host,
    path: twitterConfig.path,
    headers: {}
  }

  if (params) {
    opts.path += '?' + querystring.stringify(params)
  }

  var url = twitterConfig.protocol + '://' + opts.host + opts.path
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
      .pipe(sculpt.split(twitterConfig.delimiter)).on('error', handleError)
      // https://dev.twitter.com/docs/streaming-apis/messages#Blank_lines
      .pipe(sculpt.filter(function (line) {
        return !! line.trim()
      }))                                          .on('error', handleError)
      .pipe(sculpt.map(JSON.parse))                .on('error', handleError)
      .pipe(tweetable)
  }).on('error', handleError)

  return tweetable
}
