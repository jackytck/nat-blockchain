const Blockchain = require('../../src/blockchain')
const Block = require('../../src/blockchain/block')

describe('Blockchain', () => {
  let bc, bc2

  beforeEach(() => {
    bc = new Blockchain()
    bc2 = new Blockchain()
  })

  it('start with genesis block', () => {
    expect(bc.chain[0]).toEqual(Block.genesis())
  })

  it('add a new block', () => {
    const data = 'nat'
    bc.addBlock({ data })

    expect(bc.chain[bc.chain.length - 1].data).toEqual(data)
  })

  it('validates a valid chain', () => {
    bc2.addBlock({ data: 'foo' })

    expect(bc.isValidChain({ chain: bc2.chain })).toBe(true)
  })

  it('invalidates a chain with a corrupt genesis block', () => {
    bc2.chain[0].data = 'Bad data'

    expect(bc.isValidChain({ chain: bc2.chain })).toBe(false)
  })

  it('invalidates a corrupt chain', () => {
    bc.addBlock({ data: 'foo' })
    bc.chain[1].data = 'Not foo'

    expect(bc.isValidChain({ chain: bc.chain })).toBe(false)
  })

  it('replaces the chain with a valid chain', () => {
    bc2.addBlock({ data: 'goo' })
    bc.replaceChain({ chain: bc2.chain })

    expect(bc.chain).toEqual(bc2.chain)
  })

  it('does not replace the chain with one of less than or equal to length', () => {
    bc.addBlock({ data: 'foo' })
    bc.replaceChain({ chain: bc2.chain })

    expect(bc.chain).not.toEqual(bc2.chain)
  })
})
