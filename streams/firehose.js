var TwitterStream = require('../lib/TwitterStream')

module.exports = function (api, oauth) {
  var opts = {
    subdomain: 'stream',
    route: 'statuses/firehose'
  }

  return new TwitterStream(opts, api, oauth)
}
