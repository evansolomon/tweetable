module.exports = {
  TwitterStream: require('./lib/TwitterStream'),
  firehose: require('./streams/firehose'),
  sample: require('./streams/sample'),
  filter: require('./streams/filter'),
  user: require('./streams/user')
}
