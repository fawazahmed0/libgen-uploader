
// IPFS hash can be generated from ipfs-core or ipfs-only-hash
// currently ipfs-only-hash works fine, but ipfs-core is not due to sha2-256 hashAlg getting overridden
// Ref : https://github.com/ipfs/js-ipfs/issues/3952
const fs = require('fs');
const path = require('path');
const IPFS =  require('ipfs-core')  

async function test() {

const ipfs = await IPFS.create({start: false})
const pathToFile = path.join(__dirname,'heart.pdf')
const stream = fs.createReadStream(pathToFile)
const { cid } = await ipfs.add(stream,{onlyHash:true,cidVersion:1,hashAlg:'blake2b-256'})
console.info(cid.toString())


const Hash = require('ipfs-only-hash')
const hash = await Hash.of(stream,{cidVersion:1,rawLeaves:true,hashAlg:'blake2b-256'})
console.log(hash)

}
test()

