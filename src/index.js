module.exports = (web3, options = {}) => {
  options.maxAttempts = options.maxAttempts || 240
  options.timeInterval = options.timeInterval || 1000

  return (tx) => {
    let attempts = 0

    const makeAttempt = (tx) => {
      return new Promise((resolve, reject) => {
        web3.eth.getTransaction(tx, (err, results) => {
          if (err) {
            reject(err)
            return
          }

          if (results.blockHash) {
            resolve(results.blockHash)
            return
          }

          if (attempts++ >= options.maxAttempts) {
            reject(new Error('Transaction ' + tx + ' wasn\'t processed in ' + attempts + ' attempts!'))
            return
          }

          resolve()
        })
      })
    }

    const recursion = () => {
      return makeAttempt(tx).then(blockHash => {
        if (blockHash) {
          return blockHash
        } else {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve()
            }, options.timeInterval)
          }).then(() => {
            return recursion()
          })
        }
      })
    }

    return recursion()
  }
}
