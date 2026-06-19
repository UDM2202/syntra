const { ethers } = require('ethers')
require('dotenv').config()

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY
const AGENT_ADDRESS = process.env.AGENT_ADDRESS

console.log('🔑 Private Key exists:', !!AGENT_PRIVATE_KEY)
console.log('📍 Agent Address:', AGENT_ADDRESS)

if (!AGENT_PRIVATE_KEY) {
  console.log('❌ No private key found in .env')
  process.exit(1)
}

async function testWallet() {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider)
    
    console.log('✅ Wallet connected:', wallet.address)
    
    const balance = await provider.getBalance(wallet.address)
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB`)
    
    if (parseFloat(ethers.utils.formatEther(balance)) > 0.001) {
      console.log('🔄 Testing transaction...')
      const tx = await wallet.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther('0.0001')
      })
      console.log('✅ Tx hash:', tx.hash)
    } else {
      console.log('⚠️ Insufficient balance for test transaction')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testWallet()