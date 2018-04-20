const TransactionPool = require('../../src/wallet/transaction-pool')
const Wallet = require('../../src/wallet')
const Blockchain = require('../../src/blockchain')

describe('TransactionPool', () => {
  let tp, senderWallet, transaction, bc

  beforeEach(() => {
    tp = new TransactionPool()
    bc = new Blockchain()
    senderWallet = new Wallet()
    const recipient = 'r4nd-4dr355'
    const amount = 30
    transaction = senderWallet.createTransaction({ recipient, amount, blockchain: bc, transactionPool: tp })
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

  it('clears transaction', () => {
    tp.clear()
    expect(tp.transactions).toEqual([])
  })

  describe('mixing valid and corrupt transactions', () => {
    let validTransactions

    beforeEach(() => {
      validTransactions = [...tp.transactions]
      for (let i = 0; i < 6; i++) {
        senderWallet = new Wallet()
        transaction = senderWallet.createTransaction({
          recipient: 'r4nd-4dr355',
          amount: 50,
          blockchain: bc,
          transactionPool: tp
        })
        if (i % 2 === 0) {
          transaction.input.amount = 99999
        } else {
          validTransactions.push(transaction)
        }
      }
    })

    it('shows a difference between valid and corrupt transactions', () => {
      expect(tp.transactions).not.toEqual(validTransactions)
    })

    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTransactions)
    })
  })
})
