const Transaction = require('../../src/wallet/transaction')
const Wallet = require('../../src/wallet')

describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount

  beforeEach(() => {
    senderWallet = new Wallet()
    amount = 50
    recipient = 'r3c1p13nt'
    transaction = Transaction.newTransaction({ senderWallet, recipient, amount })
  })

  it('outputs the `amount` subtracted from the wallet balance', () => {
    expect(transaction.outputs.find(output => output.address === senderWallet.publicKey).amount)
      .toEqual(senderWallet.balance - amount)
  })

  it('outputs the `amount` added to the recipient', () => {
    expect(transaction.outputs.find(output => output.address === recipient).amount)
      .toEqual(amount)
  })

  it('inputs the balance of the wallet', () => {
    expect(transaction.input.amount).toEqual(senderWallet.balance)
  })

  describe('transacting with an amount that exceeds the balance', () => {
    beforeEach(() => {
      amount = 50000
      transaction = Transaction.newTransaction({ senderWallet, recipient, amount })
    })

    it('does not create the transaction', () => {
      expect(transaction).toEqual(undefined)
    })
  })
})
