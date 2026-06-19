// decode-reveal.cjs
require('dotenv').config()

const encodedKey = 'yW1f/ejPfxQX1Q6w7yxP/qfZ8hcPomHBL7Ph48SlU2/PqBdtB2BgLgzd14boBesUVcFRREXt7PlFTCA+kT7Cr30NeyThAmwFYXfwzv2R13PepAsa/TmI7PK6NFu5JJSS'

console.log('🔐 Encoded Key:', encodedKey)

// Try decoding as Base64
const decoded = Buffer.from(encodedKey, 'base64')
console.log('📦 Decoded (hex):', decoded.toString('hex'))
console.log('📏 Length (bytes):', decoded.length)
console.log('📏 Length (hex chars):', decoded.toString('hex').length)

// Check if it's a valid private key (32 bytes = 64 hex chars)
if (decoded.length === 32) {
  console.log('✅ This IS a valid 32-byte private key!')
  console.log('🔑 Private Key (hex):', decoded.toString('hex'))
} else if (decoded.length === 64) {
  console.log('⚠️ This is 64 bytes - might be a public key or seed')
} else {
  console.log('❌ This is NOT a valid private key (needs to be 32 bytes)')
  console.log('📝 This might be a mnemonic seed phrase or encrypted data')
}