'use strict';

module.exports = function (web3) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  options.maxAttempts = options.maxAttempts || 240;
  options.timeInterval = options.timeInterval || 1000;

  return function (tx) {
    var attempts = 0;

    var makeAttempt = function makeAttempt(tx) {
      return new Promise(function (resolve, reject) {
        web3.eth.getTransaction(tx, function (err, results) {
          if (err) {
            reject(err);
            return;
          }

          if (results.blockHash) {
            resolve(results.blockHash);
            return;
          }

          if (attempts++ >= options.maxAttempts) {
            reject(new Error('Transaction ' + tx + ' wasn\'t processed in ' + attempts + ' attempts!'));
            return;
          }

          resolve();
        });
      });
    };

    var recursion = function recursion() {
      return makeAttempt(tx).then(function (blockHash) {
        if (blockHash) {
          return blockHash;
        } else {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve();
            }, options.timeInterval);
          }).then(function () {
            return recursion();
          });
        }
      });
    };

    return recursion();
  };
};