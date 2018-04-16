const { INITIAL_BALANCE } = require('../config')
const ChainUtil = require('../chain-util')
const Transaction = require('./transaction')

class Wallet {
  constructor () {
    this.balance = INITIAL_BALANCE
    this.keyPair = ChainUtil.genKeyPair()
    this.publicKey = this.keyPair.getPublic().encode('hex')
  }

  toString () {
    return `Wallet -
      publicKey: ${this.publicKey.toString()}
      balance  : ${this.balance}
    `
  }

  sign ({ dataHash }) {
    return this.keyPair.sign(dataHash)
  }

  createTransaction ({ recipient, amount, transactionPool }) {
    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`)
      return
    }
    let transaction = transactionPool.existingTransaction({ address: this.publicKey })

    if (transaction) {
      transaction.update({ senderWallet: this, recipient, amount })
    } else {
      transaction = Transaction.newTransaction({ senderWallet: this, recipient, amount })
      transactionPool.updateOrAddTransaction({ transaction })
    }

    return transaction
  }

  static blockchainWallet () {
    const blockchainWallet = new this()
    blockchainWallet.address = 'blockchain-wallet'
    return blockchainWallet
  }
}

module.exports = Wallet
