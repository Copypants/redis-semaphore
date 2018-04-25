"use strict";
var redis = require('redis');
var bluebird = require('bluebird');
if (!redis.RedisClient.prototype.setAsync) {
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);
}
