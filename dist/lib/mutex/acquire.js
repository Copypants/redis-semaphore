"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__1 = $__initTailRecursiveFunction(acquireMutex);
var $__typeof = $__interopRequire("traceur/dist/commonjs/runtime/modules/typeof.js").default;
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var debug = require('debug')('redis-semaphore:mutex:acquire');
var delay = require('../utils/delay');
function acquireMutex(client, key, identifier) {
  return $__call(function(client, key, identifier) {
    var lockTimeout,
        acquireTimeout,
        retryInterval,
        end,
        result;
    var $arguments = arguments;
    return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
      return $__call(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              lockTimeout = $arguments[3] !== (void 0) ? $arguments[3] : 10000;
              acquireTimeout = $arguments[4] !== (void 0) ? $arguments[4] : 10000;
              retryInterval = $arguments[5] !== (void 0) ? $arguments[5] : 10;
              end = Date.now() + acquireTimeout;
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = (Date.now() < end) ? 12 : 16;
              break;
            case 12:
              debug(key, identifier, 'attempt');
              $ctx.state = 13;
              break;
            case 13:
              Promise.resolve(client.setAsync(key, identifier, 'NX', 'PX', lockTimeout)).then($ctx.createCallback(3), $ctx.errback);
              return;
            case 3:
              result = $ctx.value;
              $ctx.state = 2;
              break;
            case 2:
              debug('result', (typeof result === 'undefined' ? 'undefined' : $__typeof(result)), result);
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = (result === 'OK') ? 7 : 9;
              break;
            case 7:
              debug(key, identifier, 'acquired');
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = true;
              $ctx.state = 5;
              break;
            case 5:
              $ctx.state = -2;
              break;
            case 9:
              Promise.resolve(delay(retryInterval)).then($ctx.createCallback(21), $ctx.errback);
              return;
            case 16:
              debug(key, identifier, 'timeout');
              $ctx.state = 23;
              break;
            case 23:
              $ctx.returnValue = false;
              $ctx.state = 18;
              break;
            case 18:
              $ctx.state = -2;
              break;
            default:
              return $__continuation($ctx.end, $ctx, []);
          }
      }, this, arguments);
    }), this]);
  }, this, arguments);
}
module.exports = acquireMutex;
