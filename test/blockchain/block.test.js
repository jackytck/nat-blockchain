const Block = require('../../src/blockchain/block')

describe('Block', () => {
  let data, lastBlock, block

  beforeEach(() => {
    data = 'nat'
    lastBlock = Block.genesis()
    block = Block.mineBlock({ lastBlock, data })
  })

  it('sets the `data` to match the input', () => {
    expect(block.data).toEqual(data)
  })

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash)
  })
})
