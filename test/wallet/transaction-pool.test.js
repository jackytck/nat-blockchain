const TransactionPool = require('../../src/wallet/transaction-pool')
const Transaction = require('../../src/wallet/transaction')
const Wallet = require('../../src/wallet')

describe('TransactionPool', () => {
  let tp, senderWallet, transaction

  beforeEach(() => {
    tp = new TransactionPool()
    senderWallet = new Wallet()
    const recipient = 'r4nd-4dr355'
    const amount = 30
    transaction = Transaction.newTransaction({ senderWallet, recipient, amount })
    tp.updateOrAddTransaction({ transaction })
  })

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
  })

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction)
    const newTransaction = transaction.update({ senderWallet, recipient: 'foo-4ddr355', amount: 40 })
    tp.updateOrAddTransaction({ transaction: newTransaction })

    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
      .not.toEqual(oldTransaction)
  })
})
