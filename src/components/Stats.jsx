// src/components/Stats.jsx - CORRECT
import React, { memo, useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { API_URL } from '../utils/api'
import { TrendingUp, Award, Activity, DollarSign, Wallet } from 'lucide-react'

const Stats = memo(function Stats({ isMobile = false }) {
  const { state } = useApp()
  const { walletConnected, walletAddress } = state
  
  // ✅ ALL hooks MUST be called on EVERY render
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ useEffect called every time
  useEffect(() => {
    // If wallet not connected, just set loading to false
    if (!walletConnected || !walletAddress) {
      setIsLoading(false)
      return
    }

    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_URL}/api/balance?address=${walletAddress}`)
        const data = await response.json()
        if (data.success) {
          setBalance(data.balance || 0)
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [walletConnected, walletAddress])

  // ✅ useMemo called every time
  const statsData = useMemo(() => {
    // Return empty array if not connected
    if (!walletConnected) {
      return []
    }
    
    return [
      {
        label: 'Your Balance (BNB)',
        value: isLoading ? '...' : balance.toFixed(4),
        icon: Activity,
        gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
        subtext: '🔴 Your Wallet Balance'
      },
      // ... other stats
    ]
  }, [balance, isLoading, walletConnected])

  const getGridColumns = () => {
    if (isMobile) return 'repeat(2, 1fr)'
    return 'repeat(4, 1fr)'
  }

  // ✅ NO early return before hooks. Render conditionally inside JSX.
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: getGridColumns(),
      gap: isMobile ? '12px' : '20px',
      width: '100%'
    }}>
      {!walletConnected ? (
        // Show "Connect wallet" message inside JSX, not as early return
        <div style={{
          gridColumn: '1 / -1',
          padding: isMobile ? '16px 18px' : '24px 28px',
          borderRadius: '20px',
          background: 'rgba(20, 20, 30, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <Wallet size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            🔗 Connect your wallet to see stats
          </p>
          <p style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(255,255,255,0.2)' }}>
            Go to Wallet tab to connect
          </p>
        </div>
      ) : (
        // Show stats when connected
        statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              style={{
                padding: isMobile ? '16px 18px' : '24px 28px',
                borderRadius: '20px',
                background: 'rgba(20, 20, 30, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: isMobile ? '11px' : '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, letterSpacing: '-0.5px', marginTop: '4px' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  padding: isMobile ? '8px' : '12px',
                  borderRadius: '12px',
                  background: stat.gradient,
                  opacity: 0.12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={isMobile ? 18 : 24} style={{ color: 'white' }} />
                </div>
              </div>
              {stat.subtext && (
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: '4px'
                }}>
                  {stat.subtext}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
})

export default Stats