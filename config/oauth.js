var config = {
  version: '1.0',
  signatureMethod: 'HMAC-SHA1',
}

// This doesn't really need to be a function, but the Twitter config does. It's only a function
// for consistency.
module.exports = function () {
  return config
}
