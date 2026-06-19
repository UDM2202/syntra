// force-send.cjs
const { ethers } = require('ethers')
require('dotenv').config()

const OLD_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY
const NEW_ADDRESS = '0x5c6F53Ad58D8755a7998A97d4e57c726909F9fD2'

async function forceSend() {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
    const wallet = new ethers.Wallet(OLD_PRIVATE_KEY, provider)
    
    console.log('📍 From:', wallet.address)
    console.log('📍 To:', NEW_ADDRESS)
    
    // Get current balance
    const balance = await provider.getBalance(wallet.address)
    const balanceBNB = parseFloat(ethers.utils.formatEther(balance))
    console.log('💰 Current balance:', balanceBNB, 'BNB')
    
    // Calculate gas (estimated)
    const gasPrice = await provider.getGasPrice()
    const gasLimit = 21000
    const gasCost = gasPrice.mul(gasLimit)
    const gasCostBNB = parseFloat(ethers.utils.formatEther(gasCost))
    console.log('⛽ Estimated gas cost:', gasCostBNB, 'BNB')
    
    // Amount to send = balance - gas cost (leave a tiny buffer)
    const amountToSend = balanceBNB - gasCostBNB - 0.0001
    console.log('📤 Sending:', amountToSend.toFixed(8), 'BNB')
    
    if (amountToSend <= 0) {
      console.log('❌ Not enough to cover gas!')
      return
    }
    
    const tx = await wallet.sendTransaction({
      to: NEW_ADDRESS,
      value: ethers.utils.parseEther(amountToSend.toString()),
      gasLimit: 21000,
      gasPrice: gasPrice
    })
    
    console.log('🔄 Tx sent:', tx.hash)
    console.log('🔗 https://bscscan.com/tx/' + tx.hash)
    
    const receipt = await tx.wait()
    console.log('✅ Confirmed! Block:', receipt.blockNumber)
    
    // Check new balance
    const newBalance = await provider.getBalance(NEW_ADDRESS)
    console.log('💰 New wallet now has:', ethers.utils.formatEther(newBalance), 'BNB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

forceSend()