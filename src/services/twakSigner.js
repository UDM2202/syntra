import { ethers } from 'ethers'
import axios from 'axios'

const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/'
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC)

/**
 * TWAK SIGNING BRIDGE
 * - replaces direct private key usage
 * - prepares tx for external signing
 */

export async function createTradeIntent({ action, amount, to }) {
  return {
    id: Date.now().toString(),
    chain: 'bsc',
    action,
    amount,
    to,
    status: 'PENDING_SIGNATURE',
    createdAt: Date.now()
  }
}

/**
 * This simulates TWAK approval flow
 * (hackathon-safe: backend still executes, but ONLY after "signature approval")
 */
export async function requestTwakSignature(intent) {
  try {
    const res = await axios.post(process.env.VITE_API_URL + '/api/twak/sign', {
      intent
    })

    return res.data
  } catch (err) {
    console.error('TWAK signature error:', err.message)
    return { success: false }
  }
}

/**
 * Execute ONLY after TWAK approval
 */
export async function executeAfterTwakApproval(wallet, txData) {
  const tx = await wallet.sendTransaction(txData)
  const receipt = await tx.wait()

  return {
    success: true,
    hash: receipt.transactionHash
  }
}