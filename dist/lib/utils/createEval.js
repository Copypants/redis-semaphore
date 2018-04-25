"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__6,
    $__8 = $__initTailRecursiveFunction(createSHA1),
    $__10 = $__initTailRecursiveFunction(createEval);
var $__asyncWrap = $__interopRequire("traceur/dist/commonjs/runtime/modules/asyncWrap.js").default;
var debug = require('debug')('redis-semaphore:eval');
var crypto = require('crypto');
function createSHA1(script) {
  return $__call(function(script) {
    return ($__6 = crypto.createHash('sha1').update(script, 'utf8'), $__continuation($__6.digest, $__6, ['hex']));
  }, this, arguments);
}
function isNoScriptError(err) {
  return err.command === 'EVALSHA' && err.code === 'NOSCRIPT';
}
function createEval(script) {
  return $__call(function(script) {
    var keysCount = arguments[1] !== (void 0) ? arguments[1] : 0;
    var sha1 = createSHA1(script);
    var baseArgs = [script, keysCount];
    var baseSHAArgs = [sha1, keysCount];
    debug('creating script:', script, 'sha1:', sha1);
    return $__continuation($__initTailRecursiveFunction, null, [function optimizedEval(client, args) {
      return $__call(function(client, args) {
        var evalSHAArgs,
            evalArgs,
            $__0,
            $__1,
            $__2,
            $__3,
            $__4,
            $__5,
            err;
        return $__continuation($__asyncWrap, null, [$__initTailRecursiveFunction(function($ctx) {
          return $__call(function($ctx) {
            while (true)
              switch ($ctx.state) {
                case 0:
                  evalSHAArgs = baseSHAArgs.concat(args || []);
                  debug(sha1, 'attempt, args:', evalSHAArgs);
                  $ctx.state = 30;
                  break;
                case 30:
                  $ctx.pushTry(22, null);
                  $ctx.state = 25;
                  break;
                case 25:
                  $__0 = client.evalshaAsync;
                  $__1 = $__0.call(client, evalSHAArgs);
                  $ctx.state = 5;
                  break;
                case 5:
                  Promise.resolve($__1).then($ctx.createCallback(3), $ctx.errback);
                  return;
                case 3:
                  $__2 = $ctx.value;
                  $ctx.state = 2;
                  break;
                case 2:
                  $ctx.returnValue = $__2;
                  $ctx.state = 7;
                  break;
                case 7:
                  $ctx.state = -2;
                  break;
                case 8:
                  $ctx.popTry();
                  $ctx.state = -2;
                  break;
                case 22:
                  $ctx.popTry();
                  $ctx.maybeUncatchable();
                  err = $ctx.storedException;
                  $ctx.state = 21;
                  break;
                case 21:
                  $ctx.state = (isNoScriptError(err)) ? 17 : 19;
                  break;
                case 17:
                  evalArgs = baseArgs.concat(args || []);
                  debug(sha1, 'fallback to eval, args:', evalArgs);
                  $ctx.state = 18;
                  break;
                case 18:
                  $__3 = client.evalAsync;
                  $__4 = $__3.call(client, evalArgs);
                  $ctx.state = 13;
                  break;
                case 13:
                  Promise.resolve($__4).then($ctx.createCallback(11), $ctx.errback);
                  return;
                case 11:
                  $__5 = $ctx.value;
                  $ctx.state = 10;
                  break;
                case 10:
                  $ctx.returnValue = $__5;
                  $ctx.state = 15;
                  break;
                case 15:
                  $ctx.state = -2;
                  break;
                case 19:
                  throw err;
                  $ctx.state = -2;
                  break;
                default:
                  return $__continuation($ctx.end, $ctx, []);
              }
          }, this, arguments);
        }), this]);
      }, this, arguments);
    }]);
  }, this, arguments);
}
module.exports = createEval;
