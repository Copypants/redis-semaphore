const _ = require('underscore')
const LostLockError = require('./errors/LostLockError')
const debug = require('debug')('redis-semaphore:mutex:instance')
const mutex = require('./mutex/index.js')

const REFRESH_INTERVAL_COEF = 0.8

const DEFAULT_TIMEOUTS = {
  lockTimeout: 10000,
  acquireTimeout: 10000,
  retryInterval: 10
}

class RedisMutex {
  constructor(
    client,
    key,
    {
      lockTimeout,
      acquireTimeout,
      retryInterval,
      refreshInterval
    } = DEFAULT_TIMEOUTS
  ) {
    if (!client) {
      throw new Error('"client" is required')
    }
    if (!_.isFunction(client.setAsync) || 
        !_.isFunction(client.getAsync) || 
        !_.isFunction(client.zremAsync) || 
        !_.isFunction(client.zrangeAsync) || 
        !_.isFunction(client.zcardAsync) || 
        !_.isFunction(client.pttlAsync) || 
        !_.isFunction(client.evalAsync) || 
        !_.isFunction(client.evalshaAsync)) {
      throw new Error('"client" is not a proper Redis client')
    }
    if (!key) {
      throw new Error('"key" is required')
    }
    if (typeof key !== 'string') {
      throw new Error('"key" must be a string')
    }
    this._client = client
    this._key = key
    this._lockTimeout = lockTimeout
    this._acquireTimeout = acquireTimeout
    this._retryInterval = retryInterval
    this._refreshTimeInterval =
      refreshInterval || lockTimeout * REFRESH_INTERVAL_COEF
    this._refresh = this._refresh.bind(this)
  }
  _startRefresh() {
    this._refreshInterval = setInterval(
      this._refresh,
      this._refreshTimeInterval
    )
    this._refreshInterval.unref()
  }
  _stopRefresh() {
    clearInterval(this._refreshInterval)
  }
  async _refresh() {
    debug(`refresh mutex (key: ${this._key}, identifier: ${this._identifier})`)
    const refreshed = await mutex.refresh(
      this._client,
      this._key,
      this._identifier,
      this._lockTimeout
    )
    if (!refreshed) {
      throw new LostLockError(`Lost mutex for key ${this._key}`)
    }
  }

  async acquire() {
    debug(`acquire mutex (key: ${this._key})`)
    this._identifier = await mutex.acquire(
      this._client,
      this._key,
      this._lockTimeout,
      this._acquireTimeout,
      this._retryInterval
    )
    this._startRefresh()
    return this._identifier
  }

  async release() {
    debug(`release mutex (key: ${this._key}, identifier: ${this._identifier})`)
    const released = await mutex.release(
      this._client,
      this._key,
      this._identifier
    )
    this._stopRefresh()
    return released
  }
}

module.exports = RedisMutex
