"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__1 = $__initTailRecursiveFunction(releaseSemaphore);
var $__typeof = $__interopRequire("traceur/dist/commonjs/runtime/modules/typeof.js").default;
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var debug = require('debug')('redis-semaphore:semaphore:release');
function releaseSemaphore(client, key, identifier) {
  return $__call(function(client, key, identifier) {
    var result;
    return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
      return $__call(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              debug(key, identifier);
              $ctx.state = 8;
              break;
            case 8:
              Promise.resolve(client.zremAsync(key, identifier)).then($ctx.createCallback(3), $ctx.errback);
              return;
            case 3:
              result = $ctx.value;
              $ctx.state = 2;
              break;
            case 2:
              debug('result', (typeof result === 'undefined' ? 'undefined' : $__typeof(result)), result);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.returnValue = result === 1;
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
}
module.exports = releaseSemaphore;
