const Transaction = require('./transaction')

class TransactionPool {
  constructor () {
    this.transactions = []
  }

  updateOrAddTransaction ({ transaction }) {
    let transactionWithId = this.transactions.find(t => t.id === transaction.id)

    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction
    } else {
      this.transactions.push(transaction)
    }
  }

  existingTransaction ({ address }) {
    return this.transactions.find(t => t.input.address === address)
  }

  validTransactions () {
    const sumTransactionOutput = array => {
      return array.reduce((total, output) => {
        return total + output.amount
      }, 0)
    }

    return this.transactions.filter(t => {
      const outputTotal = sumTransactionOutput(t.outputs)

      if (t.input.amount !== outputTotal) {
        console.error(`Invalid transaction from ${t.input.address}.`)
        return false
      }

      if (!Transaction.verifyTransaction({ transaction: t })) {
        console.error(`Invalid transaction from ${t.input.address}.`)
        return false
      }

      return true
    })
  }

  clear () {
    this.transactions = []
  }
}

module.exports = TransactionPool
