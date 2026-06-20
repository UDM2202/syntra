// src/components/marketplace/Marketplace.jsx - MINIMAL WORKING VERSION
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '../../context/AppContext'
import { API_URL } from '../../utils/api'
import { ethers } from 'ethers'
import { ShoppingCart, Star, Shield, TrendingUp, TrendingDown, Loader } from 'lucide-react'

export default function Marketplace({ isMobile = false, isTablet = false }) {
  const { state, dispatch } = useApp()
  const { address, isConnected } = useAccount()
  const [purchasing, setPurchasing] = useState(null)
  const [agentSignals, setAgentSignals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState({})

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agent-signals`)
        const data = await response.json()
        if (data.success) {
          setAgentSignals(data.signals)
        }
      } catch (error) {
        console.error('Failed to fetch agent signals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSignals()
    const interval = setInterval(fetchSignals, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePurchase = async (agentType, price) => {
    // ✅ Use wagmi's isConnected
    if (!isConnected || !address) {
      alert('❌ Please connect your wallet first')
      return
    }

    // ✅ Double check with window.ethereum
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        alert('❌ Wallet not unlocked. Please unlock your wallet.')
        return
      }
    } catch (e) {
      alert('❌ Please unlock your wallet')
      return
    }

    setPurchasing(agentType)
    setPaymentStatus(prev => ({ 
      ...prev, 
      [agentType]: { status: 'pending', message: 'Getting quote...' } 
    }))

    try {
      const quoteResponse = await fetch(`${API_URL}/api/purchase-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentType, price })
      })
      
      if (!quoteResponse.ok) throw new Error(`HTTP error! status: ${quoteResponse.status}`)
      
      const quote = await quoteResponse.json()
      if (!quote.success) throw new Error(quote.error || 'Failed to get payment quote')

      if (!window.ethereum) {
        throw new Error('Please install MetaMask or Trust Wallet')
      }

      // ✅ Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      
      // ✅ Check network
      const network = await provider.getNetwork()
      if (network.chainId !== 56) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }]
          })
        } catch (switchError) {
          throw new Error('Please switch to BNB Smart Chain')
        }
      }

      const signer = provider.getSigner()
      
      // ✅ Verify signer has an address
      const signerAddress = await signer.getAddress()
      if (!signerAddress || signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Wallet address mismatch. Please reconnect.')
      }

      setPaymentStatus(prev => ({ 
        ...prev, 
        [agentType]: { status: 'pending', message: 'Sending payment...' } 
      }))

      // ✅ Send transaction
      const tx = await signer.sendTransaction({
        to: quote.recipient,
        value: ethers.utils.parseEther(price.toString()),
        gasLimit: 21000
      })

      setPaymentStatus(prev => ({ 
        ...prev, 
        [agentType]: { status: 'pending', message: 'Confirming payment...' } 
      }))

      await tx.wait()
      
      const confirmResponse = await fetch(`${API_URL}/api/confirm-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentType,
          txHash: tx.hash,
          price: price
        })
      })
      
      const confirmData = await confirmResponse.json()
      
      if (confirmData.success) {
        setPaymentStatus(prev => ({ 
          ...prev, 
          [agentType]: { 
            status: 'success', 
            message: '✅ Purchased!',
            txHash: tx.hash 
          } 
        }))

        dispatch({
          type: 'PURCHASE_SIGNAL',
          payload: { agent: agentType, price }
        })

        console.log(`✅ ${agentType} signal purchased: ${tx.hash}`)
      } else {
        throw new Error(confirmData.error || 'Confirmation failed')
      }
      
    } catch (error) {
      console.error('Purchase error:', error)
      
      if (error.code === 4001) {
        setPaymentStatus(prev => ({ 
          ...prev, 
          [agentType]: { 
            status: 'error', 
            message: '❌ Transaction rejected in wallet' 
          } 
        }))
      } else {
        setPaymentStatus(prev => ({ 
          ...prev, 
          [agentType]: { 
            status: 'error', 
            message: error.message || 'Purchase failed' 
          } 
        }))
      }
    } finally {
      setPurchasing(null)
    }
  }

  const getAgentData = (type) => {
    const data = {
      whale: { icon: '🐋', gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)', description: 'Smart Money Movement' },
      narrative: { icon: '📰', gradient: 'linear-gradient(135deg, #00D4AA, #34D399)', description: 'Market Narrative Strength' },
      derivatives: { icon: '📊', gradient: 'linear-gradient(135deg, #FF6B6B, #F87171)', description: 'Funding & Leverage' }
    }
    return data[type]
  }

  const getGridColumns = () => {
    if (isMobile) return '1fr'
    if (isTablet) return 'repeat(2, 1fr)'
    return 'repeat(3, 1fr)'
  }

  // Show connect prompt if not connected
  if (!isConnected) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        borderRadius: '20px',
        background: 'rgba(20,20,30,0.6)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Wallet size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
        <h3 style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
          🔗 Connect your wallet to purchase signals
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
          Go to the Wallet tab to connect
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '28px' }}>
      <div style={{
        padding: isMobile ? '16px 20px' : '28px 32px',
        borderRadius: '20px',
        background: 'rgba(20, 20, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCart size={isMobile ? 20 : 24} style={{ color: '#6C3CE1' }} />
            Intelligence Marketplace
          </h2>
          <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            {loading ? 'Loading live signals...' : `Wallet: ${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: isMobile ? '6px 14px' : '8px 18px',
          borderRadius: '100px',
          background: 'rgba(0,212,170,0.1)',
          border: '1px solid rgba(0,212,170,0.15)'
        }}>
          <div style={{
            width: isMobile ? '6px' : '8px',
            height: isMobile ? '6px' : '8px',
            borderRadius: '50%',
            background: agentSignals ? '#00D4AA' : '#FF6B6B',
            animation: agentSignals ? 'pulseGlow 1.5s ease-in-out infinite' : 'none'
          }} />
          <span style={{ fontSize: isMobile ? '11px' : '13px', color: agentSignals ? '#00D4AA' : '#FF6B6B' }}>
            {agentSignals ? '🔴 LIVE' : '⏳ LOADING'}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
          ⏳ Loading signals...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: getGridColumns(),
          gap: isMobile ? '16px' : '24px'
        }}>
          {state.marketplace.map((item) => {
            const agent = state.agents.find(a => a.type === item.agent)
            const agentData = getAgentData(item.agent)
            const isPurchased = item.purchased
            const isPurchasingAgent = purchasing === item.agent
            const status = paymentStatus[item.agent]
            const signal = agentSignals?.[item.agent]

            return (
              <div
                key={item.agent}
                style={{
                  padding: isMobile ? '20px' : '32px',
                  borderRadius: '20px',
                  background: 'rgba(20, 20, 30, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isPurchased ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: agentData.gradient,
                  opacity: isPurchased ? 1 : 0.3
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: isMobile ? '44px' : '56px',
                      height: isMobile ? '44px' : '56px',
                      borderRadius: isMobile ? '12px' : '16px',
                      background: agentData.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '22px' : '28px',
                      flexShrink: 0
                    }}>
                      {agentData.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {item.agent}
                      </h3>
                      <p style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.4)' }}>
                        {agentData.description}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isMobile ? '4px 10px' : '6px 14px',
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <Star size={isMobile ? 12 : 14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 600 }}>{Math.round(item.trust)}</span>
                  </div>
                </div>

                {signal ? (
                  <div style={{
                    padding: isMobile ? '14px' : '18px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.3)' }}>Current Signal</span>
                      <span style={{
                        fontSize: isMobile ? '11px' : '13px',
                        fontWeight: 500,
                        padding: '4px 14px',
                        borderRadius: '100px',
                        background: signal.direction === 'bullish' ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)',
                        color: signal.direction === 'bullish' ? '#00D4AA' : '#FF6B6B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {signal.direction === 'bullish' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {signal.direction === 'bullish' ? 'Bullish' : 'Bearish'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: isMobile ? '20px' : '32px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Confidence</p>
                        <p style={{ fontSize: '18px', fontWeight: 600 }}>{signal.confidence}%</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Price</p>
                        <p style={{ fontSize: '18px', fontWeight: 600 }}>${signal.price.toFixed(2)}</p>
                      </div>
                      {signal.change24h !== undefined && (
                        <div>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>24h Change</p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: signal.change24h > 0 ? '#00D4AA' : '#FF6B6B' }}>
                            {signal.change24h > 0 ? '+' : ''}{signal.change24h.toFixed(2)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: isMobile ? '14px' : '18px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    marginBottom: '24px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    ⏳ Loading signal...
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>Trust Score</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{Math.round(item.trust)}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${item.trust}%`,
                      height: '100%',
                      borderRadius: '6px',
                      background: 'linear-gradient(90deg, #6C3CE1, #00D4AA)',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
                    <span>Accuracy: {Math.round(agent?.accuracy || 70)}%</span>
                    <span>{item.price} BNB</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item.agent, item.price)}
                  disabled={isPurchased || isPurchasingAgent}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: (isPurchased || isPurchasingAgent) ? 'default' : 'pointer',
                    background: isPurchased 
                      ? 'rgba(0,212,170,0.1)' 
                      : isPurchasingAgent
                        ? 'rgba(255,255,255,0.05)'
                        : 'linear-gradient(135deg, #6C3CE1, #00D4AA)',
                    color: isPurchased ? '#00D4AA' : isPurchasingAgent ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {isPurchased ? (
                    <>
                      <Shield size={18} />
                      Signal Purchased ✓
                    </>
                  ) : isPurchasingAgent ? (
                    <>
                      <Loader size={18} className="animate-spin-slow" />
                      {status?.message || 'Processing x402...'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Purchase {item.price} BNB (x402)
                    </>
                  )}
                </button>

                {status && status.status === 'pending' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(0,212,170,0.1)',
                    border: '1px solid rgba(0,212,170,0.15)',
                    fontSize: '11px',
                    color: '#00D4AA'
                  }}>
                    ⏳ {status.message}
                  </div>
                )}

                {status && status.status === 'success' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(0,212,170,0.1)',
                    border: '1px solid rgba(0,212,170,0.15)',
                    fontSize: '11px',
                    color: '#00D4AA'
                  }}>
                    ✅ {status.message}
                    {status.txHash && (
                      <>
                        <br />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                          Tx: {status.txHash.slice(0, 20)}...{status.txHash.slice(-10)}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {status && status.status === 'error' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255,107,107,0.1)',
                    border: '1px solid rgba(255,107,107,0.15)',
                    fontSize: '11px',
                    color: '#FF6B6B'
                  }}>
                    ❌ {status.message}
                  </div>
                )}

                {isPurchased && !status && (
                  <div style={{
                    marginTop: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#00D4AA'
                  }}>
                    ✓ Signal integrated into intelligence pool
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}