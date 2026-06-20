import React, { memo, useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '../context/AppContext'
import { API_URL } from '../utils/api'
import { TrendingUp, Activity, DollarSign, Wallet } from 'lucide-react'

const safeNumber = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const Stats = memo(function Stats({ isMobile = false }) {
  const { address, isConnected } = useAccount()
  const { dispatch } = useApp()

  const [balance, setBalance] = useState(0)
  const [tradeData, setTradeData] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0
  })
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  useEffect(() => {
    dispatch({
      type: 'SET_WALLET',
      payload: {
        connected: Boolean(isConnected && address),
        address: isConnected && address ? address : null
      }
    })
  }, [isConnected, address, dispatch])

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(0)
      setTradeData({ totalTrades: 0, winRate: 0, totalPnL: 0 })
      setHasLoadedOnce(false)
      return
    }

    let isMounted = true

    const fetchData = async () => {
      try {
        const balanceRes = await fetch(`${API_URL}/api/balance?address=${address}`)
        const balanceData = await balanceRes.json()

        const statusRes = await fetch(`${API_URL}/api/status`)
        const statusData = await statusRes.json()

        if (!isMounted) return

        setBalance(balanceData?.success ? safeNumber(balanceData.balance, 0) : 0)

        if (statusData?.success) {
          const trades = Array.isArray(statusData.trades) ? statusData.trades : []

          setTradeData({
            totalTrades: safeNumber(statusData.totalTrades ?? trades.length, 0),
            winRate: safeNumber(statusData.winRate, 0),
            totalPnL: safeNumber(statusData.totalPnL, 0)
          })

          dispatch({
            type: 'SYNC_BACKEND_STATUS',
            payload: statusData
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        if (isMounted) setHasLoadedOnce(true)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isConnected, address, dispatch])

  const statsData = useMemo(() => {
    if (!isConnected) return []

    return [
      {
        label: 'Balance',
        value: !hasLoadedOnce ? '...' : safeNumber(balance, 0).toFixed(4),
        unit: 'BNB',
        icon: Activity,
        gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
        subtext: '🔴 Your Wallet Balance'
      },
      {
        label: 'Total Trades',
        value: !hasLoadedOnce ? '...' : safeNumber(tradeData.totalTrades, 0),
        icon: Activity,
        gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)'
      },
      {
        label: 'Win Rate',
        value: !hasLoadedOnce ? '...' : `${safeNumber(tradeData.winRate, 0).toFixed(1)}%`,
        icon: TrendingUp,
        gradient: 'linear-gradient(135deg, #00D4AA, #34D399)'
      },
      {
        label: 'Total P&L',
        value: !hasLoadedOnce ? '...' : `$${safeNumber(tradeData.totalPnL, 0).toFixed(2)}`,
        icon: DollarSign,
        gradient: 'linear-gradient(135deg, #EF4444, #F87171)'
      }
    ]
  }, [balance, tradeData, hasLoadedOnce, isConnected])

  const getGridColumns = () => {
    if (isMobile) return 'repeat(2, 1fr)'
    return 'repeat(4, 1fr)'
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: isMobile ? '12px' : '20px',
        width: '100%'
      }}
    >
      {!isConnected ? (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: isMobile ? '16px 18px' : '24px 28px',
            borderRadius: '20px',
            background: 'rgba(20, 20, 30, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center'
          }}
        >
          <Wallet size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            🔗 Connect your wallet to see stats
          </p>
        </div>
      ) : (
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
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: isMobile ? '11px' : '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {stat.label}
                  </p>

                  <p style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, marginTop: '4px' }}>
                    {stat.value}
                  </p>

                  {stat.unit && (
                    <p style={{ fontSize: isMobile ? '18px' : '28px', fontWeight: 700 }}>
                      {stat.unit}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    padding: isMobile ? '8px' : '12px',
                    borderRadius: '12px',
                    background: stat.gradient,
                    opacity: 0.12
                  }}
                >
                  <Icon size={isMobile ? 18 : 24} style={{ color: 'white' }} />
                </div>
              </div>

              {stat.subtext && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
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