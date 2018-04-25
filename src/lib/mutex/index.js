const TimeoutError = require('../errors/TimeoutError');
const acquireMutex = require('./acquire');
const refreshMutex = require('./refresh');
const releaseMutex = require('./release');
const uuid4 = require('uuid/v4');
require('../utils/promisifyRedis');

function getKey(key) {
  return `mutex:${key}`;
}

function acquire(
  client,
  key,
  lockTimeout,
  acquireTimeout,
  retryInterval
) {
  const identifier = uuid4();
  const finalKey = getKey(key);
  return acquireMutex(
    client,
    finalKey,
    identifier,
    lockTimeout,
    acquireTimeout,
    retryInterval
  ).then(result => {
    if (result) {
      return identifier;
    } else {
      throw new TimeoutError(`Acquire mutex ${key} timeout`);
    }
  });
}

function refresh(client, key, identifier, lockTimeout) {
  const finalKey = getKey(key);
  return refreshMutex(client, finalKey, identifier, lockTimeout);
}

function release(client, key, identifier) {
  const finalKey = getKey(key);
  return releaseMutex(client, finalKey, identifier);
}

exports.acquire = acquire;
exports.refresh = refresh;
exports.release = release;
