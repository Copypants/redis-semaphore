const debug = require('debug')('redis-semaphore:mutex:instance');

import { isFunction } from "underscore";
import LostLockError from "./errors/LostLockError";
import mutex from "./mutex";

const REFRESH_INTERVAL_COEF = 0.8;

const DEFAULT_TIMEOUTS = {
  lockTimeout: 10000,
  acquireTimeout: 10000,
  retryInterval: 10
};

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
    if (!isFunction(client.setAsync) || 
        !isFunction(client.getAsync) || 
        !isFunction(client.zremAsync) || 
        !isFunction(client.zrangeAsync) || 
        !isFunction(client.zcardAsync) || 
        !isFunction(client.pttlAsync) || 
        !isFunction(client.evalAsync) || 
        !isFunction(client.evalshaAsync)) {
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
    this._refresh = this._refresh.bind(this);
  }
  _startRefresh() {
    this._refreshInterval = setInterval(
      this._refresh,
      this._refreshTimeInterval
    );
    this._refreshInterval.unref();
  }
  _stopRefresh() {
    clearInterval(this._refreshInterval);
  }
  _refresh() {
    debug(`refresh mutex (key: ${this._key}, identifier: ${this._identifier})`);
    return mutex.refresh(
      this._client,
      this._key,
      this._identifier,
      this._lockTimeout
    ).tap(refreshed => {
      if (!refreshed) {
        throw new LostLockError(`Lost mutex for key ${this._key}`);
      }
    });
  }

  acquire() {
    debug(`acquire mutex (key: ${this._key})`);
    return mutex.acquire(
      this._client,
      this._key,
      this._lockTimeout,
      this._acquireTimeout,
      this._retryInterval
    ).then(identifier => {
      this._identifier = identifier;
      this._startRefresh();
      return this._identifier;
    });
  }

  release() {
    debug(`release mutex (key: ${this._key}, identifier: ${this._identifier})`);
    return mutex.release(
      this._client,
      this._key,
      this._identifier
    ).tap(() => {
      this._stopRefresh();
    })
  }
}

export default RedisMutex;
