const Blockchain = require('../src/blockchain')

const bc = new Blockchain()

for (let i = 0; i < 10; i++) {
  console.log(bc.addBlock({ data: `foo ${i}` }).toString())
}
