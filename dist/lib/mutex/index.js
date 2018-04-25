"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__5 = $__initTailRecursiveFunction(acquire),
    $__7 = $__initTailRecursiveFunction(refresh),
    $__9 = $__initTailRecursiveFunction(release);
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var TimeoutError = require('../errors/TimeoutError');
var acquireMutex = require('./acquire');
var refreshMutex = require('./refresh');
var releaseMutex = require('./release');
var uuid4 = require('uuid/v4');
require('../utils/promisifyRedis');
function getKey(key) {
  return ("mutex:" + key);
}
function acquire(client, key, lockTimeout, acquireTimeout, retryInterval) {
  return $__call(function(client, key, lockTimeout, acquireTimeout, retryInterval) {
    var identifier,
        finalKey,
        result;
    return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
      return $__call(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              identifier = uuid4();
              finalKey = getKey(key);
              $ctx.state = 11;
              break;
            case 11:
              Promise.resolve(acquireMutex(client, finalKey, identifier, lockTimeout, acquireTimeout, retryInterval)).then($ctx.createCallback(3), $ctx.errback);
              return;
            case 3:
              result = $ctx.value;
              $ctx.state = 2;
              break;
            case 2:
              $ctx.state = (result) ? 4 : 7;
              break;
            case 4:
              $ctx.returnValue = identifier;
              $ctx.state = 5;
              break;
            case 5:
              $ctx.state = -2;
              break;
            case 7:
              throw new TimeoutError(("Acquire mutex " + key + " timeout"));
              $ctx.state = -2;
              break;
            default:
              return $__continuation($ctx.end, $ctx, []);
          }
      }, this, arguments);
    }), this]);
  }, this, arguments);
}
function refresh(client, key, identifier, lockTimeout) {
  return $__call(function(client, key, identifier, lockTimeout) {
    var finalKey,
        $__0,
        $__1;
    return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
      return $__call(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              finalKey = getKey(key);
              $ctx.state = 10;
              break;
            case 10:
              $__0 = refreshMutex(client, finalKey, identifier, lockTimeout);
              $ctx.state = 5;
              break;
            case 5:
              Promise.resolve($__0).then($ctx.createCallback(3), $ctx.errback);
              return;
            case 3:
              $__1 = $ctx.value;
              $ctx.state = 2;
              break;
            case 2:
              $ctx.returnValue = $__1;
              $ctx.state = 7;
              break;
            case 7:
              $ctx.state = -2;
              break;
            default:
              return $__continuation($ctx.end, $ctx, []);
          }
      }, this, arguments);
    }), this]);
  }, this, arguments);
}
function release(client, key, identifier) {
  return $__call(function(client, key, identifier) {
    var finalKey,
        $__2,
        $__3;
    return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
      return $__call(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              finalKey = getKey(key);
              $ctx.state = 10;
              break;
            case 10:
              $__2 = releaseMutex(client, finalKey, identifier);
              $ctx.state = 5;
              break;
            case 5:
              Promise.resolve($__2).then($ctx.createCallback(3), $ctx.errback);
              return;
            case 3:
              $__3 = $ctx.value;
              $ctx.state = 2;
              break;
            case 2:
              $ctx.returnValue = $__3;
              $ctx.state = 7;
              break;
            case 7:
              $ctx.state = -2;
              break;
            default:
              return $__continuation($ctx.end, $ctx, []);
          }
      }, this, arguments);
    }), this]);
  }, this, arguments);
}
exports.acquire = acquire;
exports.refresh = refresh;
exports.release = release;
