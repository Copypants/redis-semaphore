"use strict";
function $__interopRequire(id) {
  id = require(id);
  return id && id.__esModule && id || {default: id};
}
var $__continuation = $__interopRequire("traceur/dist/commonjs/runtime/modules/continuation.js").default;
var $__call = $__interopRequire("traceur/dist/commonjs/runtime/modules/call.js").default;
var $__initTailRecursiveFunction = $__interopRequire("traceur/dist/commonjs/runtime/modules/initTailRecursiveFunction.js").default;
var $__construct = $__interopRequire("traceur/dist/commonjs/runtime/modules/construct.js").default;
var $__1 = $__initTailRecursiveFunction(delay);
function delay(ms) {
  return $__call(function(ms) {
    return $__continuation($__construct, Promise, [$__initTailRecursiveFunction(function(resolve) {
      return $__call(function(resolve) {
        return $__continuation(setTimeout, null, [resolve, ms]);
      }, this, arguments);
    })]);
  }, this, arguments);
}
module.exports = delay;
