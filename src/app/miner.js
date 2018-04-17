const Transaction = require('../wallet/transaction')
const Wallet = require('../wallet')

class Miner {
  constructor ({ blockchain, transactionPool, wallet, p2pServer }) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.wallet = wallet
    this.p2pServer = p2pServer
  }

  mine () {
    const validTransactions = this.transactionPool.validTransactions()

    // include a reward for the miner
    const reward = Transaction.rewardTransaction({
      minerWallet: this.wallet,
      blockchainWallet: Wallet.blockchainWallet()
    })
    validTransactions.push(reward)

    const block = this.blockchain.addBlock({ data: validTransactions })
    this.p2pServer.syncChains()
    this.transactionPool.clear()
    this.p2pServer.broadcastClearTransactions()

    return block
  }
}

module.exports = Miner
