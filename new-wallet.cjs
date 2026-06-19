const { ethers } = require('ethers')
const fs = require('fs')

const wallet = ethers.Wallet.createRandom()

console.log('\n🎯 NEW WALLET GENERATED')
console.log('═'.repeat(50))
console.log('📍 Address:', wallet.address)
console.log('🔑 Private Key (hex):', wallet.privateKey)
console.log('📝 Seed Phrase:', wallet.mnemonic.phrase)
console.log('═'.repeat(50))
console.log('\n⚠️  SAVE THESE SECURELY!')
console.log('📋 Copy the Private Key to .env\n')

// Save to .env automatically
const envContent = `\n# New wallet generated ${new Date().toISOString()}\nAGENT_PRIVATE_KEY=${wallet.privateKey.replace('0x', '')}\nAGENT_ADDRESS=${wallet.address}\n`
fs.appendFileSync('.env', envContent)
console.log('✅ Added to .env file')