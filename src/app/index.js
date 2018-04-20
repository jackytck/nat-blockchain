const Blockchain = require('../blockchain')
const P2PServer = require('./p2p-server')
const bodyParser = require('body-parser')
const express = require('express')
const Wallet = require('../wallet')
const TransactionPool = require('../wallet/transaction-pool')
const Miner = require('./miner')

const HTTP_PORT = process.env.HTTP_PORT || 3001

const app = express()
const bc = new Blockchain()
const wallet = new Wallet()
const tp = new TransactionPool()
const p2pServer = new P2PServer({ blockchain: bc, transactionPool: tp })
const miner = new Miner({ blockchain: bc, transactionPool: tp, wallet, p2pServer })

app.use(bodyParser.json())

app.get('/blocks', (req, res) => {
  res.json(bc.chain)
})

app.post('/mine', (req, res) => {
  const { data } = req.body
  const block = bc.addBlock({ data })
  console.log(`New block added: ${block.toString()}`)

  p2pServer.syncChains()

  res.redirect('/blocks')
})

app.get('/transactions', (req, res) => {
  res.json(tp.transactions)
})

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body
  const transaction = wallet.createTransaction({ recipient, amount, blockchain: bc, transactionPool: tp })
  p2pServer.broadcastTransaction({ transaction })
  res.redirect('/transactions')
})

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine()
  console.log(`New block added: ${block.toString()}`)
  res.redirect('/blocks')
})

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey })
})

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}...`))
p2pServer.listen()
