const ChainUtil = require('../chain-util')
const { MINING_REWARD } = require('../config')

class Transaction {
  constructor () {
    this.id = ChainUtil.id()
    this.input = null
    this.outputs = []
  }

  update ({ senderWallet, recipient, amount }) {
    const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey)

    if (amount > senderOutput.amount) {
      console.log(`Amount: ${amount} exceeds balance.`)
      return
    }

    senderOutput.amount -= amount
    this.outputs.push({
      amount,
      address: recipient
    })
    Transaction.signTransaction({ transaction: this, senderWallet })

    return this
  }

  static transactionWithOutputs ({ senderWallet, outputs }) {
    const transaction = new this()
    transaction.outputs.push(...outputs)
    Transaction.signTransaction({ transaction, senderWallet })
    return transaction
  }

  static newTransaction ({ senderWallet, recipient, amount }) {
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`)
      return
    }

    const outputs = [
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount, address: recipient }
    ]
    return Transaction.transactionWithOutputs({ senderWallet, outputs })
  }

  static rewardTransaction ({ minerWallet, blockchainWallet }) {
    const outputs = [
      { amount: MINING_REWARD, address: minerWallet.publicKey }
    ]
    return Transaction.transactionWithOutputs({ senderWallet: blockchainWallet, outputs })
  }

  static signTransaction ({ transaction, senderWallet }) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign({ dataHash: ChainUtil.hash(transaction.outputs) })
    }
  }

  static verifyTransaction ({ transaction }) {
    return ChainUtil.verifySignature({
      publicKey: transaction.input.address,
      signature: transaction.input.signature,
      dataHash: ChainUtil.hash(transaction.outputs)
    })
  }
}

module.exports = Transaction
