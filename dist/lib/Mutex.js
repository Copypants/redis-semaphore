"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
Object.defineProperties(module.exports, {
  __esModule: {value: true},
  default: {
    enumerable: true,
    get: function() {
      return $__default;
    }
  }
});
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var $__createClass = $__interopRequire("traceur/dist/commonjs/runtime/modules/createClass.js").default;
var debug = require('debug')('redis-semaphore:mutex:instance');
var isFunction = require("underscore").isFunction;
var LostLockError = $__interopRequire("./errors/LostLockError").default;
var $__12 = require("./mutex"),
    refresh = $__12.refresh,
    _acquire = $__12.acquire,
    _release = $__12.release;
var REFRESH_INTERVAL_COEF = 0.8;
var DEFAULT_TIMEOUTS = {
  lockTimeout: 10000,
  acquireTimeout: 10000,
  retryInterval: 10
};
var RedisMutex = $__initTailRecursiveFunction(function() {
  return $__call(function() {
    function RedisMutex(client, key) {
      var $__1 = arguments[2] !== (void 0) ? arguments[2] : DEFAULT_TIMEOUTS,
          lockTimeout = $__1.lockTimeout,
          acquireTimeout = $__1.acquireTimeout,
          retryInterval = $__1.retryInterval,
          refreshInterval = $__1.refreshInterval;
      if (!client) {
        throw new Error('"client" is required');
      }
      if (!isFunction(client.setAsync) || !isFunction(client.getAsync) || !isFunction(client.zremAsync) || !isFunction(client.zrangeAsync) || !isFunction(client.zcardAsync) || !isFunction(client.pttlAsync) || !isFunction(client.evalAsync) || !isFunction(client.evalshaAsync)) {
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
    return $__continuation($__createClass, null, [RedisMutex, {
      _startRefresh: function() {
        this._refreshInterval = setInterval(this._refresh, this._refreshTimeInterval);
        this._refreshInterval.unref();
      },
      _stopRefresh: function() {
        clearInterval(this._refreshInterval);
      },
      _refresh: $__initTailRecursiveFunction(function() {
        return $__call(function() {
          var refreshed;
          return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
            return $__call(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    debug(("refresh mutex (key: " + this._key + ", identifier: " + this._identifier + ")"));
                    $ctx.state = 5;
                    break;
                  case 5:
                    Promise.resolve(refresh(this._client, this._key, this._identifier, this._lockTimeout)).then($ctx.createCallback(3), $ctx.errback);
                    return;
                  case 3:
                    refreshed = $ctx.value;
                    $ctx.state = 2;
                    break;
                  case 2:
                    if (!refreshed) {
                      throw new LostLockError(("Lost mutex for key " + this._key));
                    }
                    $ctx.state = -2;
                    break;
                  default:
                    return $__continuation($ctx.end, $ctx, []);
                }
            }, this, arguments);
          }), this]);
        }, this, arguments);
      }),
      acquire: $__initTailRecursiveFunction(function() {
        return $__call(function() {
          return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
            return $__call(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    debug(("acquire mutex (key: " + this._key + ")"));
                    $ctx.state = 8;
                    break;
                  case 8:
                    Promise.resolve(_acquire(this._client, this._key, this._lockTimeout, this._acquireTimeout, this._retryInterval)).then($ctx.createCallback(3), $ctx.errback);
                    return;
                  case 3:
                    this._identifier = $ctx.value;
                    $ctx.state = 2;
                    break;
                  case 2:
                    this._startRefresh();
                    $ctx.state = 10;
                    break;
                  case 10:
                    $ctx.returnValue = this._identifier;
                    $ctx.state = 5;
                    break;
                  case 5:
                    $ctx.state = -2;
                    break;
                  default:
                    return $__continuation($ctx.end, $ctx, []);
                }
            }, this, arguments);
          }), this]);
        }, this, arguments);
      }),
      release: $__initTailRecursiveFunction(function() {
        return $__call(function() {
          var released;
          return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
            return $__call(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    debug(("release mutex (key: " + this._key + ", identifier: " + this._identifier + ")"));
                    $ctx.state = 8;
                    break;
                  case 8:
                    Promise.resolve(_release(this._client, this._key, this._identifier)).then($ctx.createCallback(3), $ctx.errback);
                    return;
                  case 3:
                    released = $ctx.value;
                    $ctx.state = 2;
                    break;
                  case 2:
                    this._stopRefresh();
                    $ctx.state = 10;
                    break;
                  case 10:
                    $ctx.returnValue = released;
                    $ctx.state = 5;
                    break;
                  case 5:
                    $ctx.state = -2;
                    break;
                  default:
                    return $__continuation($ctx.end, $ctx, []);
                }
            }, this, arguments);
          }), this]);
        }, this, arguments);
      })
    }, {}]);
  }, this, arguments);
})();
var $__default = RedisMutex;
