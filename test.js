/* global describe, it */
const { assert } = require('chai')
const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
const waitTransaction = require('./src')(web3)

describe('wait-transaction', () => {
  it('should send transaction and wait for confirmation by tx id', done => {
    return new Promise((resolve, reject) => {
      const [account1, account2] = web3.eth.accounts

      web3.eth.sendTransaction({
        from: account1,
        to: account2,
        value: 1
      }, (err, tx) => {
        if (err) {
          reject(err)
          return
        }

        resolve(tx)
      })
    }).then(txId => {
      return waitTransaction(txId).then(blockHash => {
        return {
          blockHash,
          txId
        }
      })
    }).then(opts => {
      const { txId, blockHash } = opts

      return new Promise((resolve, reject) => {
        web3.eth.getTransaction(txId, (err, results) => {
          if (err) {
            reject(err)
            return
          }

          resolve(results.blockHash)
        })
      }).then(bH => {
        assert.equal(blockHash, bH)
      })
    }).then(done).catch(done)
  })
})
