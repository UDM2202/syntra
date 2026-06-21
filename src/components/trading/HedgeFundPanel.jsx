import React, { useEffect, useState } from 'react'
import { API_URL } from '../../utils/api'

export default function HedgeFundPanel({ status }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const ws = new WebSocket(API_URL.replace('http', 'ws'))

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)

      if (msg.type === 'market') {
        setData(msg.data)
      }
    }

    return () => ws.close()
  }, [])

  const m = data?.hedgeMetrics || status?.hedgeMetrics

  if (!m) return null

  return (
    <div style={{
      padding: 20,
      borderRadius: 16,
      background: '#0B0B1A',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <h3>🏦 Hedge Fund Desk</h3>

      <div style={{ marginTop: 10 }}>
        <h4>Market Regime</h4>
        <div style={{
          fontSize: 20,
          color:
            m.regime === 'RISK-ON' ? '#00D4AA' :
            m.regime === 'RISK-OFF' ? '#FF4D4D' :
            '#FFD700'
        }}>
          {m.regime}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginTop: 20
      }}>
        <Metric label="Volatility" value={m.volatility} />
        <Metric label="Liquidity" value={m.liquidity} />
        <Metric label="Whale Flow" value={m.whaleFlow} />
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      background: '#141428'
    }}>
      <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 18 }}>{value}</div>
    </div>
  )
}