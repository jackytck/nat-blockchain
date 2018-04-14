const Websocket = require('ws')

// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 yarn dev
const P2P_PORT = process.env.P2P_PORT || 5001
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []

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
      const chain = JSON.parse(message)

      this.blockchain.replaceChain({ chain })
    })
  }

  sendChain (socket) {
    socket.send(JSON.stringify(this.blockchain.chain))
  }

  syncChains () {
    this.sockets.forEach(socket => this.sendChain(socket))
  }
}

module.exports = P2PServer
