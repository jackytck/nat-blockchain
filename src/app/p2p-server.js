const Websocket = require('ws')

// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 yarn dev
const P2P_PORT = process.env.P2P_PORT || 5001
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS'
}

class P2PServer {
  constructor ({ blockchain, transactionPool }) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.sockets = []
  }

  listen () {
    const server = new Websocket.Server({
      port: P2P_PORT
    })
    server.on('connection', socket => this.connectSocket(socket))

    this.connectToPeers()

    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}...`)
  }

  connectToPeers () {
    peers.forEach(peer => {
      // peer: ws://localhost:5001
      const socket = new Websocket(peer)

      socket.on('open', () => this.connectSocket(socket))
    })
  }

  connectSocket (socket) {
    this.sockets.push(socket)
    console.log('Socket connected')

    this.messageHandler(socket)
    this.sendChain(socket)
  }

  messageHandler (socket) {
    socket.on('message', message => {
      const data = JSON.parse(message)
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain({ chain: data.chain })
          break
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction({ transaction: data.transaction })
          break
        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear()
          break
      }
    })
  }

  sendChain (socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }))
  }

  sendTransaction ({ socket, transaction }) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }))
  }

  syncChains () {
    this.sockets.forEach(socket => this.sendChain(socket))
  }

  broadcastTransaction ({ transaction }) {
    this.sockets.forEach(socket => this.sendTransaction({ socket, transaction }))
  }

  broadcastClearTransactions () {
    this.sockets.forEach(socket => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transactions
    })))
  }
}

module.exports = P2PServer
