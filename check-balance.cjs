// check-balance.cjs
const { ethers } = require('ethers')

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')

const addresses = [
  '0x86eA20EAD33da4ce68D0cfF12c8b93cE8a60e36f',
  '0x94A0c2bC90c6730Ada9d03024Ee6adB0DEe1f163',
  '0x844c3427630eebff3fa03268b7b08e04F233DA3c'
]

async function checkBalances() {
  for (const addr of addresses) {
    const balance = await provider.getBalance(addr)
    const bnb = parseFloat(ethers.utils.formatEther(balance))
    console.log(addr, ':', bnb, 'BNB')
  }
}

checkBalances()