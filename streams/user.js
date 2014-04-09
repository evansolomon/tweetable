var TwitterStream = require('../lib/TwitterStream')

module.exports = function (api, oauth, params) {
  var opts = {
    subdomain: 'userstream',
    route: 'user',
    params: params
  }

  return new TwitterStream(opts, api, oauth)
}
