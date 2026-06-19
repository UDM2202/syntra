// decode-key.cjs
require('dotenv').config()

const encodedKey = process.env.AGENT_PRIVATE_KEY

console.log('🔑 Original (Base64):', encodedKey)

if (!encodedKey) {
  console.log('❌ AGENT_PRIVATE_KEY not found in .env')
  console.log('📋 Current .env content:')
  console.log(require('fs').readFileSync('.env', 'utf8'))
  process.exit(1)
}

// Decode from Base64 to hex
const decodedBuffer = Buffer.from(encodedKey, 'base64')
const hexKey = decodedBuffer.toString('hex')

console.log('🔑 Decoded (Hex):', hexKey)
console.log('📏 Length:', hexKey.length, 'characters')
console.log('✅ Valid hex?', /^[0-9a-f]+$/.test(hexKey))