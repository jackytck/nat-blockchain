const Block = require('../src/block')

const block = new Block({ timestamp: 'foo', lastHash: 'bar', hash: 'zoo', data: 'baz' })
console.log(block.toString())
console.log(Block.genesis().toString())
