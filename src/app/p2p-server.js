const Websocket = require('ws')

// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 yarn dev
const P2P_PORT = process.env.P2P_PORT || 5001
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []

class P2PServer {
  constructor ({ blockchain }) {
    this.blockchain = blockchain
    this.sockets = []
  }

  listen () {
    const server = new Websocket.Server({
      port: P2P_PORT
    })
    server.on('connection', socket => this.connectSocket(socket))
    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}...`)
  }

  connectSocket (socket) {
    this.sockets.push(socket)
    console.log('Socket connected')
  }
}