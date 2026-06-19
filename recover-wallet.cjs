// recover-wallet.cjs
const { ethers } = require('ethers')

// REPLACE with your 12-word seed phrase
const seedPhrase = 'sure screen illegal document burger category wheel race midnight slight grain yellow'

// Recover the wallet
const wallet = ethers.Wallet.fromMnemonic(seedPhrase)

console.log('📍 Recovered Address:', wallet.address)
console.log('🔑 Private Key:', wallet.privateKey)

// Check if this matches the old wallet
const oldAddress = '0x844c3427630eebff3fa03268b7b08e04F233DA3c'
if (wallet.address.toLowerCase() === oldAddress.toLowerCase()) {
  console.log('✅ MATCH! This is the old wallet!')
  console.log('📋 Copy this private key to .env')
} else {
  console.log('❌ This does NOT match the old wallet')
  console.log('📍 This wallet address:', wallet.address)
}