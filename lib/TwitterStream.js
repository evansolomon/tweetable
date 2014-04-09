var querystring = require('querystring')
var util = require('util')

var OAuth = require('oauth').OAuth

var HttpsJsonStream = require('./HttpsJsonStream')

module.exports = TwitterStream
util.inherits(TwitterStream, HttpsJsonStream)
function TwitterStream(opts, apiCredentials, oauthCredentials) {
  // Stream-specific args
  this.opts = opts
  this.apiCredentials = apiCredentials
  this.oauthCredentials = oauthCredentials

  // Twitter API
  this.twitterApi = {
    version: '1.1',
    extension: '.json',
    protocol: 'https',
    domain: 'twitter.com'
  }

  // oAuth details
  this.oauthOpts = {
    version: '1.0',
    signatureMethod: 'HMAC-SHA1'
  }

  // Begin fetching data from Twitter
  HttpsJsonStream.call(this, this.getRequestArgs())
  this.createReadStream()
}

TwitterStream.prototype.getAuthHeader = function () {
  var url = this.getUrl()

  var oauth = new OAuth(
    null,                          // Request URL, not used
    null,                          // Access URL, not used
    this.apiCredentials.key,       // Twitter API key
    this.apiCredentials.secret,    // Twitter API secret
    this.oauthOpts.version,
    null,                          // Callback URL, not used
    this.oauthOpts.signatureMethod
  )

  return oauth.authHeader(url, this.oauthCredentials.token, this.oauthCredentials.secret)
}

TwitterStream.prototype.getRequestArgs = function () {
  return {
    hostname: this.getHost(),
    path: this.getPath(),
    headers: {
      Authorization: this.getAuthHeader()
    }
  }
}

TwitterStream.prototype.getUrl = function () {
  return this.twitterApi.protocol + '://' + this.getHost() + this.getPath()
}

TwitterStream.prototype.getHost = function () {
  // console.log('getting host', this.domain)
  return this.opts.subdomain + '.' + this.twitterApi.domain
}

TwitterStream.prototype.getEndopint = function () {
  return '/' + this.twitterApi.version + '/' + this.opts.route + this.twitterApi.extension
}

TwitterStream.prototype.getPath = function () {
  var path = this.getEndopint()
  if (this.opts.params) {
    path += '?' + querystring.stringify(this.opts.params)
  }

  return path
}
