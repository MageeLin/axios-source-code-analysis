'use strict';

var Cancel = require('./Cancel');

/**
 *  `CancelToken` 是被用于取消请求操作的类
 *
 * @class
 * @param {Function} executor 执行器
 */
function CancelToken(executor) {
  // 执行器的类型判断
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  // 闭包，拿到resolve
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // 如果reason属性已经有值，说明已经取消过了
      return;
    }

    // 将取消原因组成的Cancel对象 resolve出去
    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * 如果已经取消过了，就把Cancel对象抛出去
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * 返回一个对象，对象包含新的"CancelToken"对象和一个函数，该函数在调用时取消"CancelToken"。
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;
