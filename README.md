# Tweetable

Readable streams of tweets from Twitter's [public stream API's](https://dev.twitter.com/docs/streaming-apis/streams/public).

Tweets + Readable = Tweetable.

Very alpha at the moment.


## Usage

Arguments

* `api`: API credentials from Twitter. Object with `key` and `secret` properties.
* `access`: Access credentials from Twitter (unique to the user the request is being made for). Object with `token` and `secret` properties.
* `params`: Params for [filter streams](https://dev.twitter.com/docs/api/1.1/post/statuses/filter) or [user streams](https://dev.twitter.com/docs/api/1.1/get/user). *Do not use with sample or firehose streams.*

Returns a readable stream that emits an object for each Tweet (not strings or buffers, like most Node streams).

```js
var tweetable = require('tweetable')

var api = {
  key: 'twitter app API key',
  secret: 'twitter app API secret'
}
var access = {
  token: 'twitter user access token',
  secret: 'twitter user access secret'
}

tweetable.filter(api, access, {track: 'california'}).on('data', function (tweet) {
  var localCreatedAt = new Date(Date.parse(tweet.created_at))
  console.log('%s: %s', localCreatedAt, tweet.text)
}).on('error', function (err) {
  console.error(err, err.stack)
  process.exit(1)
})
```
