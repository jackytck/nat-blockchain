const Blockchain = require('../src/blockchain')
const Block = require('../src/block')

describe('Blockchain', () => {
  let bc

  beforeEach(() => {
    bc = new Blockchain()
  })

  it('start with genesis block', () => {
    expect(bc.chain[0]).toEqual(Block.genesis())
  })

  it('add a new block', () => {
    const data = 'nat'
    bc.addBlock({ data })

    expect(bc.chain[bc.chain.length - 1].data).toEqual(data)
  })
})
