import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { API_URL } from '../../utils/api'
import { ethers } from 'ethers'
import { Brain, Zap, ArrowRight, Clock, Play, Square, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TraderDecision({ isMobile = false }) {
  const { state, dispatch } = useApp()
  const { walletAddress } = state
  const [showDetails, setShowDetails] = useState(false)
  const [isAutoTrading, setIsAutoTrading] = useState(false)
  const [autoStatus, setAutoStatus] = useState('Idle')
  const [currentDecision, setCurrentDecision] = useState(null)
  const [pendingTrade, setPendingTrade] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState(null)
  const [executionResult, setExecutionResult] = useState(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/status`)
        const data = await response.json()
        if (data.success) {
          setIsAutoTrading(data.isAutoTrading || false)
          setAutoStatus(data.isAutoTrading ? '🟢 Running' : '⚪ Idle')
          if (data.pendingTrade) {
            setPendingTrade(data.pendingTrade)
            console.log('📊 Pending trade detected:', data.pendingTrade)
          } else {
            setPendingTrade(null)
          }
        }
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }

    const getDecision = async () => {
      try {
        const response = await fetch(`${API_URL}/api/decision`)
        const data = await response.json()
        if (data.success && data.decision) {
          setCurrentDecision(data.decision)
          dispatch({
            type: 'UPDATE_TRADE',
            payload: {
              currentTrade: {
                decision: data.decision.decision,
                conviction: data.decision.conviction,
                price: data.decision.price
              }
            }
          })
        }
      } catch (error) {
        console.error('Failed to get decision:', error)
      }
    }
    
    checkStatus()
    getDecision()
    
    const statusInterval = setInterval(checkStatus, 3000)
    const decisionInterval = setInterval(getDecision, 5000)
    
    return () => {
      clearInterval(statusInterval)
      clearInterval(decisionInterval)
    }
  }, [dispatch])

  const startAutoTrade = async () => {
    try {
      const purchasedAgents = state.marketplace
        .filter(item => item.purchased)
        .map(item => item.agent)
      
      const response = await fetch(`${API_URL}/api/start-auto-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchasedAgents })
      })
      const result = await response.json()
      if (result.success) {
        setIsAutoTrading(true)
        setAutoStatus('🟢 Running')
      } else {
        alert(result.message || 'Failed to start auto trading')
      }
    } catch (error) {
      console.error('Start auto trade error:', error)
      alert('Failed to start auto trading. Make sure backend is running.')
    }
  }

  const stopAutoTrade = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stop-auto-trade`, {
        method: 'POST'
      })
      const result = await response.json()
      if (result.success) {
        setIsAutoTrading(false)
        setAutoStatus('⚪ Idle')
        setPendingTrade(null)
      } else {
        alert(result.message || 'Failed to stop auto trading')
      }
    } catch (error) {
      console.error('Stop auto trade error:', error)
      alert('Failed to stop auto trading')
    }
  }

  const executePendingTrade = async () => {
    if (!pendingTrade || !walletAddress) {
      setExecutionError('No trade to execute or wallet not connected')
      return
    }

    if (!window.ethereum) {
      setExecutionError('Please install MetaMask or Trust Wallet')
      return
    }

    setIsExecuting(true)
    setExecutionError(null)
    setExecutionResult(null)

    try {
      console.log('📈 Executing trade with params:', pendingTrade)

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      
      const network = await provider.getNetwork()
      if (network.chainId !== 56) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }]
          })
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (switchError) {
          setExecutionError('❌ Please switch to BNB Smart Chain')
          setIsExecuting(false)
          return
        }
      }

     const signer = provider.getSigner()
const amountIn = ethers.BigNumber.from(pendingTrade.amountIn)

let tx

if ((pendingTrade.action || 'BUY') === 'BUY') {
  const router = new ethers.Contract(
    pendingTrade.routerAddress,
    [
      'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) external payable returns (uint[])'
    ],
    signer
  )

  tx = await router.swapExactETHForTokens(
    0,
    pendingTrade.path,
    walletAddress,
    pendingTrade.deadline,
    {
      value: amountIn,
      gasLimit: 300000
    }
  )
} else if (pendingTrade.action === 'SELL') {
  const usdtContract = new ethers.Contract(
    pendingTrade.path[0],
    [
      'function approve(address spender, uint amount) public returns (bool)'
    ],
    signer
  )

  const amountIn = ethers.BigNumber.from(pendingTrade.amountIn)

  console.log('🔔 Approving USDT first')

  const approveTx = await usdtContract.approve(
    pendingTrade.routerAddress,
    amountIn
  )

  await approveTx.wait()

  const router = new ethers.Contract(
    pendingTrade.routerAddress,
    [
      'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) external returns (uint[])'
    ],
    signer
  )

  console.log('🔔 Sending SELL transaction - wallet popup should appear')

  tx = await router.swapExactTokensForETH(
    amountIn,
    0,
    pendingTrade.path,
    walletAddress,
    pendingTrade.deadline,
    {
      gasLimit: 300000
    }
  )
}

      console.log('✅ Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('✅ Confirmed! Block:', receipt.blockNumber)

      // ✅ RECORD THE TRADE IN BACKEND
      try {
        const recordResponse = await fetch(`${API_URL}/api/record-trade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  txHash: receipt.transactionHash,
  action: pendingTrade.action || 'BUY',
  amountIn: pendingTrade.amountIn,
  price: pendingTrade.price,
  expectedUSDT: pendingTrade.expectedUSDT || 0,
  expectedBNB: pendingTrade.expectedBNB || 0,
  blockNumber: receipt.blockNumber,
  walletAddress: walletAddress,
  conviction: pendingTrade.conviction || 75
})
        })
        const recordData = await recordResponse.json()
        console.log('✅ Trade recorded in backend:', recordData)
      } catch (recordError) {
        console.error('Failed to record trade:', recordError)
      }

      setExecutionResult({
        success: true,
        txHash: receipt.transactionHash,
        price: pendingTrade.price,
        amount: ethers.utils.formatEther(amountIn)
      })
      
      setPendingTrade(null)
      
      dispatch({
        type: 'UPDATE_TRADE_RESULT',
        payload: {
          result: 'EXECUTED',
          txHash: receipt.transactionHash,
          price: pendingTrade.price
        }
      })

    } catch (error) {
      console.error('Trade execution error:', error)
      
      if (error.code === 4001) {
        setExecutionError('❌ You rejected the transaction in your wallet')
      } else if (error.code === -32603) {
        setExecutionError('❌ Transaction failed. Make sure you have enough BNB for gas fees.')
      } else if (error.message && error.message.includes('insufficient funds')) {
        setExecutionError('❌ Insufficient BNB balance. Please add more BNB for gas fees.')
      } else {
        setExecutionError(`❌ ${error.message || 'Trade failed'}`)
      }
    } finally {
      setIsExecuting(false)
    }
  }

  const decision = currentDecision || state.currentTrade

  return (
    <div style={{
      padding: isMobile ? '20px' : '28px',
      borderRadius: '20px',
      background: 'rgba(20, 20, 30, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '14px' }}>
          <div style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            borderRadius: isMobile ? '12px' : '14px',
            background: 'linear-gradient(135deg, #6C3CE1, #00D4AA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Brain size={isMobile ? 18 : 22} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 600 }}>
              🤖 AI Trading
            </h3>
            <p style={{ 
              fontSize: isMobile ? '11px' : '12px', 
              color: pendingTrade ? '#00D4AA' : isAutoTrading ? '#00D4AA' : 'rgba(255,255,255,0.4)'
            }}>
              {pendingTrade ? '🚀 Trade Ready to Execute!' :
               isAutoTrading ? '🟢 Generating signals' : '⚪ Auto-trading disabled'}
            </p>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: isMobile ? '10px' : '12px',
            background: isAutoTrading ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.04)',
            color: isAutoTrading ? '#00D4AA' : 'rgba(255,255,255,0.3)'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isAutoTrading ? '#00D4AA' : 'rgba(255,255,255,0.2)',
              animation: isAutoTrading ? 'pulseGlow 1s ease-in-out infinite' : 'none'
            }} />
            {autoStatus}
          </div>
          {isAutoTrading ? (
            <button
              onClick={stopAutoTrade}
              style={{
                padding: isMobile ? '6px 14px' : '8px 20px',
                borderRadius: '10px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 600,
                border: 'none',
                background: 'rgba(255,107,107,0.15)',
                color: '#FF6B6B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Square size={isMobile ? 14 : 16} />
              Stop
            </button>
          ) : (
            <button
              onClick={startAutoTrade}
              style={{
                padding: isMobile ? '6px 14px' : '8px 20px',
                borderRadius: '10px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 600,
                border: 'none',
                background: 'linear-gradient(135deg, #6C3CE1, #00D4AA)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={isMobile ? 14 : 16} />
              Start Auto
            </button>
          )}
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: isMobile ? '12px' : '14px'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          {pendingTrade ? '🚀 Trade ready! Click "Execute Trade" below' :
           isAutoTrading ? '🤖 AI is generating trading signals' : 
           '⏸️ AI is paused'}
        </span>
        <span style={{ 
          color: pendingTrade ? '#00D4AA' : isAutoTrading ? '#00D4AA' : 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace'
        }}>
          {pendingTrade ? '🔴 TRADE READY' : isAutoTrading ? '🔴 SIGNAL GENERATOR' : '⚪ IDLE'}
        </span>
      </div>

      {decision ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderRadius: '14px',
            background: decision.decision === 'BUY' 
              ? 'rgba(0,212,170,0.05)' 
              : 'rgba(255,107,107,0.05)',
            border: `1px solid ${decision.decision === 'BUY' 
              ? 'rgba(0,212,170,0.1)' 
              : 'rgba(255,107,107,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <p style={{ 
                fontSize: isMobile ? '11px' : '13px', 
                color: 'rgba(255,255,255,0.3)' 
              }}>
                AI Signal
              </p>
              <p style={{ 
                fontSize: isMobile ? '28px' : '32px', 
                fontWeight: 700, 
                letterSpacing: '-0.5px',
                color: decision.decision === 'BUY' ? '#00D4AA' : '#FF6B6B'
              }}>
                {decision.decision}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.3)' }}>
                Conviction
              </p>
              <p style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: 700 }}>
                {Math.round(decision.conviction || 0)}%
              </p>
            </div>
          </div>

          {decision.price && (
            <div style={{
              padding: isMobile ? '12px' : '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <p style={{ fontSize: isMobile ? '10px' : '12px', color: 'rgba(255,255,255,0.3)' }}>
                Price at signal
              </p>
              <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: 'white' }}>
                ${decision.price.toFixed(2)}
              </p>
            </div>
          )}

          {pendingTrade && (
            <div style={{
              padding: isMobile ? '16px' : '20px',
              borderRadius: '14px',
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: '#00D4AA', marginBottom: '4px' }}>
                    🚀 Trade Ready to Execute
                  </h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {ethers.utils.formatEther(pendingTrade.amountIn)} BNB @ ${pendingTrade.price?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={executePendingTrade}
                  disabled={isExecuting || !walletAddress}
                  style={{
                    padding: isMobile ? '8px 20px' : '10px 24px',
                    borderRadius: '12px',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: 600,
                    border: 'none',
                    background: (isExecuting || !walletAddress)
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #00D4AA, #34D399)',
                    color: (isExecuting || !walletAddress)
                      ? 'rgba(255,255,255,0.3)'
                      : 'white',
                    cursor: (isExecuting || !walletAddress) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isExecuting ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTop: '2px solid #00D4AA',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      Executing...
                    </>
                  ) : !walletAddress ? (
                    'Connect Wallet'
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirm Trade in Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {executionResult && (
            <div style={{
              padding: isMobile ? '12px' : '14px',
              borderRadius: '10px',
              background: 'rgba(0,212,170,0.05)',
              border: '1px solid rgba(0,212,170,0.1)',
              fontSize: isMobile ? '12px' : '13px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              ✅ Trade Executed!
              <br />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                Tx: {executionResult.txHash.slice(0, 20)}...{executionResult.txHash.slice(-10)}
              </span>
              <br />
              <a
                href={`https://bscscan.com/tx/${executionResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#6C3CE1' }}
              >
                🔗 View on BSCScan
              </a>
            </div>
          )}

          {executionError && (
            <div style={{
              padding: isMobile ? '12px' : '14px',
              borderRadius: '10px',
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid rgba(255,107,107,0.15)',
              fontSize: isMobile ? '12px' : '13px',
              color: '#FF6B6B'
            }}>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: '8px' }} />
              {executionError}
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center',
          padding: isMobile ? '32px 0' : '40px 0',
          color: 'rgba(255,255,255,0.2)'
        }}>
          <Brain size={isMobile ? 32 : 40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: isMobile ? '14px' : '15px', color: 'rgba(255,255,255,0.4)' }}>
            Waiting for AI signals...
          </p>
          <p style={{ fontSize: isMobile ? '12px' : '13px', marginTop: '6px', color: 'rgba(255,255,255,0.2)' }}>
            Click "Start Auto" to begin AI signal generation
          </p>
        </div>
      )}
    </div>
  )
}