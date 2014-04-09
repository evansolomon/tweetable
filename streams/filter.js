var TwitterStream = require('../lib/TwitterStream')

module.exports = function (api, oauth, params) {
  var opts = {
    subdomain: 'stream',
    route: 'statuses/filter',
    params: params
  }

  return new TwitterStream(opts, api, oauth)
}
