const Wallet = require('../../src/wallet')
const TransactionPool = require('../../src/wallet/transaction-pool')
const Blockchain = require('../../src/blockchain')
const { INITIAL_BALANCE } = require('../../src/config')

describe('Wallet', () => {
  let wallet, tp, bc

  beforeEach(() => {
    wallet = new Wallet()
    tp = new TransactionPool()
    bc = new Blockchain()
  })

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient

    beforeEach(() => {
      sendAmount = 50
      recipient = 'r4nd0m-4ddr355'
      transaction = wallet.createTransaction({ recipient, amount: sendAmount, blockchain: bc, transactionPool: tp })
    })

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTransaction({ recipient, amount: sendAmount, blockchain: bc, transactionPool: tp })
      })

      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
          .toEqual(wallet.balance - sendAmount * 2)
      })

      it('clones the `sendAmount` output for the recipient', () => {
        expect(transaction.outputs.filter(output => output.address === recipient)
          .map(output => output.amount)).toEqual([sendAmount, sendAmount])
      })
    })
  })

  describe('calculating a balance', () => {
    let addBalance, repeatAdd, senderWallet

    beforeEach(() => {
      senderWallet = new Wallet()
      addBalance = 100
      repeatAdd = 3

      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction({
          recipient: wallet.publicKey,
          amount: addBalance,
          blockchain: bc,
          transactionPool: tp
        })
      }
      bc.addBlock({ data: tp.transactions })
    })

    it('calculates the balance for blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance({ blockchain: bc })).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd))
    })

    it('calculates the balance for blockchain transactions matching the sender', () => {
      expect(senderWallet.calculateBalance({ blockchain: bc })).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd))
    })

    describe('and the recipient conducts a transaction', () => {
      let subtractBalance, recipientBalance

      beforeEach(() => {
        tp.clear()
        subtractBalance = 60
        recipientBalance = wallet.calculateBalance({ blockchain: bc })
        wallet.createTransaction({
          recipient: senderWallet.publicKey,
          amount: subtractBalance,
          blockchain: bc,
          transactionPool: tp
        })
        bc.addBlock({ data: tp.transactions })
      })

      describe('and the sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          tp.clear()
          senderWallet.createTransaction({
            recipient: wallet.publicKey,
            amount: addBalance,
            blockchain: bc,
            transactionPool: tp
          })
          bc.addBlock({ data: tp.transactions })
        })

        it('calculates the recipient balance only using transaction since its most recent one', () => {
          expect(wallet.calculateBalance({ blockchain: bc })).toEqual(recipientBalance - subtractBalance + addBalance)
        })
      })
    })
  })
})
