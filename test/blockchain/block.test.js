const Block = require('../../src/blockchain/block')
const { DIFFICULTY } = require('../../src/config')

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

  it('generates a hash that matches the difficulty', () => {
    expect(block.hash.substr(0, DIFFICULTY)).toEqual('0'.repeat(DIFFICULTY))
    console.log(block.toString())
  })
})
