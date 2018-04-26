const _ = require('underscore');
const Bluebird = require('bluebird');
const LostLockError = require('./errors/LostLockError');
const debug = require('debug')('redis-semaphore:mutex:instance');
const mutex = require('./mutex/index.js');

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
      throw new Error('"client" is required');
    }
    if (!_.isFunction(client.setAsync) || 
        !_.isFunction(client.getAsync) || 
        !_.isFunction(client.zremAsync) || 
        !_.isFunction(client.zrangeAsync) || 
        !_.isFunction(client.zcardAsync) || 
        !_.isFunction(client.pttlAsync) || 
        !_.isFunction(client.evalAsync) || 
        !_.isFunction(client.evalshaAsync)) {
      throw new Error('"client" is not a proper Redis client');
    }
    if (!key) {
      throw new Error('"key" is required');
    }
    if (typeof key !== 'string') {
      throw new Error('"key" must be a string');
    }
    this._client = client;
    this._key = key;
    this._lockTimeout = lockTimeout;
    this._acquireTimeout = acquireTimeout;
    this._retryInterval = retryInterval;
    this._refreshTimeInterval = refreshInterval || lockTimeout * REFRESH_INTERVAL_COEF;
    this._lockIds          = new Set();
    this._refreshIntervals = new Map();
  }
  _startRefresh(identifier) {
    let refreshInterval = setInterval(
      _.bind(this._refresh, this, identifier),
      this._refreshTimeInterval
    );
    // refreshInterval.unref();
    this._refreshIntervals.set(identifier, refreshInterval);
  }
  _stopRefresh(identifier) {
    debug(`stop refresh mutex (key: ${this._key})`, identifier);
    let refreshInterval = this._refreshIntervals.get(identifier);
    refreshInterval && clearInterval(refreshInterval);
    this._refreshIntervals.delete(identifier);
  }
  _releaseAll() {
    debug(`release all for mutex (key: ${this._key})`);
    return Bluebird.map(this._lockIds.values(), lock => this.release(lock), { concurrency: 1 });
  }
  async _refresh(identifier) {
    debug(`refresh mutex (key: ${this._key}, identifier: ${identifier})`)
    const refreshed = await mutex.refresh(
      this._client,
      this._key,
      identifier,
      this._lockTimeout
    )
    if (!refreshed) {
      //throw new LostLockError(`Lost mutex for key ${this._key}`);
      console.warn(`[LostLockError] Lost mutex for key ${this._key}`);
    }
  }

  async acquire() {
    debug(`acquire mutex (key: ${this._key})`);
    let identifier = await mutex.acquire(
      this._client,
      this._key,
      this._lockTimeout,
      this._acquireTimeout,
      this._retryInterval
    );
    this._lockIds.add(identifier);
    this._startRefresh(identifier);
    return identifier;
  }

  async release(identifier) {
    debug(`release mutex (key: ${this._key}, identifier: ${identifier})`);
    const released = await mutex.release(
      this._client,
      this._key,
      identifier
    );
    this._stopRefresh(identifier);
    this._lockIds.delete(identifier);
    return released;
  }
}

module.exports = RedisMutex;
