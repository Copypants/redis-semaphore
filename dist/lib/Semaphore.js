"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var $__createClass = $__interopRequire("traceur/dist/commonjs/runtime/modules/createClass.js").default;
var $__superConstructor = $__interopRequire("traceur/dist/commonjs/runtime/modules/superConstructor.js").default;
var RedisMutex = require('./Mutex');
var debug = require('debug')('redis-semaphore:semaphore:instance');
var LostLockError = require('./errors/LostLockError');
var semaphore = require('./semaphore');
var DEFAULT_TIMEOUTS = {
  lockTimeout: 10000,
  acquireTimeout: 10000,
  retryInterval: 10
};
var RedisSemaphore = $__initTailRecursiveFunction(function($__super) {
  return $__call(function($__super) {
    function RedisSemaphore(client, key, limit) {
      var $__2 = arguments[3] !== (void 0) ? arguments[3] : DEFAULT_TIMEOUTS,
          lockTimeout = $__2.lockTimeout,
          acquireTimeout = $__2.acquireTimeout,
          retryInterval = $__2.retryInterval,
          refreshInterval = $__2.refreshInterval;
      $__superConstructor(RedisSemaphore).call(this, client, key, {
        lockTimeout: lockTimeout,
        acquireTimeout: acquireTimeout,
        retryInterval: retryInterval,
        refreshInterval: refreshInterval
      });
      if (!limit) {
        throw new Error('"limit" is required');
      }
      if (typeof limit !== 'number') {
        throw new Error('"limit" must be a number');
      }
      this._limit = parseInt(limit, 10);
    }
    return $__continuation($__createClass, null, [RedisSemaphore, {
      _refresh: $__initTailRecursiveFunction(function() {
        return $__call(function() {
          var refreshed;
          return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
            return $__call(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    debug(("refresh semaphore (key: " + this._key + ", identifier: " + this._identifier + ")"));
                    $ctx.state = 5;
                    break;
                  case 5:
                    Promise.resolve(semaphore.refresh(this._client, this._key, this._identifier)).then($ctx.createCallback(3), $ctx.errback);
                    return;
                  case 3:
                    refreshed = $ctx.value;
                    $ctx.state = 2;
                    break;
                  case 2:
                    if (!refreshed) {
                      throw new LostLockError(("Lost semaphore for key " + this._key));
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
                    debug(("acquire semaphore (key: " + this._key + ")"));
                    $ctx.state = 8;
                    break;
                  case 8:
                    Promise.resolve(semaphore.acquire(this._client, this._key, this._limit, this._lockTimeout, this._acquireTimeout, this._retryInterval)).then($ctx.createCallback(3), $ctx.errback);
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
                    debug(("release semaphore (key: " + this._key + ", identifier: " + this._identifier + ")"));
                    $ctx.state = 8;
                    break;
                  case 8:
                    Promise.resolve(semaphore.release(this._client, this._key, this._identifier)).then($ctx.createCallback(3), $ctx.errback);
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
    }, {}, $__super]);
  }, this, arguments);
})(RedisMutex);
module.exports = RedisSemaphore;
